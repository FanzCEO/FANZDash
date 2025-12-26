<?php
/**
 * FanzDash Automation Engine - Worker Daemon
 * Version: 1.0.0
 *
 * This is the engine that processes automation jobs.
 * Run with: pm2 start automation_worker.php --name automation-worker
 *
 * Or with systemd/supervisord for production.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/core.php';
require_once __DIR__ . '/actions.php';

// Configuration
define('POLL_INTERVAL_MS', 300); // 0.3 seconds
define('MAX_EXECUTION_TIME', 30); // Max seconds per action
define('BATCH_SIZE', 10); // Process up to N jobs per cycle

// Track stats
$stats = [
    'started_at' => date('c'),
    'jobs_processed' => 0,
    'jobs_succeeded' => 0,
    'jobs_failed' => 0
];

echo "[automation-worker] Starting FanzDash Automation Worker...\n";
echo "[automation-worker] Poll interval: " . POLL_INTERVAL_MS . "ms\n";
echo "[automation-worker] Max execution time: " . MAX_EXECUTION_TIME . "s\n";
echo "[automation-worker] Started at: " . $stats['started_at'] . "\n\n";

// Graceful shutdown handler
$running = true;
pcntl_async_signals(true);

pcntl_signal(SIGTERM, function() use (&$running, &$stats) {
    echo "\n[automation-worker] Received SIGTERM, shutting down gracefully...\n";
    print_stats($stats);
    $running = false;
});

pcntl_signal(SIGINT, function() use (&$running, &$stats) {
    echo "\n[automation-worker] Received SIGINT, shutting down gracefully...\n";
    print_stats($stats);
    $running = false;
});

// Main loop
while ($running) {
    try {
        $jobs_this_cycle = process_queue_cycle();

        if ($jobs_this_cycle === 0) {
            // No jobs - sleep a bit
            usleep(POLL_INTERVAL_MS * 1000);
        } else {
            $stats['jobs_processed'] += $jobs_this_cycle;
            // Brief yield before next cycle
            usleep(50000); // 50ms
        }
    } catch (Exception $e) {
        echo "[automation-worker] ERROR: " . $e->getMessage() . "\n";
        sleep(5); // Wait before retrying after error
    }
}

echo "[automation-worker] Worker stopped.\n";

/**
 * Process one cycle of the queue.
 * Returns number of jobs processed.
 */
function process_queue_cycle(): int {
    global $stats;
    $db = get_db();
    $processed = 0;

    // Find next queued jobs
    $stmt = $db->prepare(
        "SELECT * FROM automation_queue
         WHERE status = 'queued'
           AND next_attempt_at <= NOW()
         ORDER BY id ASC
         LIMIT " . BATCH_SIZE
    );
    $stmt->execute();
    $jobs = $stmt->fetchAll();

    foreach ($jobs as $job) {
        $processed++;
        process_single_job($job);
    }

    return $processed;
}

/**
 * Process a single job from the queue.
 */
function process_single_job(array $job): void {
    global $stats;
    $db = get_db();
    $start_time = microtime(true);

    $job_id = (int)$job['id'];
    $run_id = (int)$job['workflow_run_id'];
    $step_index = (int)$job['action_step_index'];

    echo "[automation-worker] Processing job #$job_id (run: $run_id, step: $step_index)...\n";

    // Mark job as running
    $db->prepare("UPDATE automation_queue SET status = 'running', started_at = NOW() WHERE id = ?")
       ->execute([$job_id]);

    // Fetch run data
    $run = fetch_run($run_id);
    if (!$run) {
        echo "[automation-worker] Run #$run_id not found, deleting job.\n";
        delete_queue_job($job_id);
        return;
    }

    // Fetch workflow
    $workflow = fetch_workflow((int)$run['workflow_id']);
    if (!$workflow) {
        echo "[automation-worker] Workflow for run #$run_id not found, deleting job.\n";
        delete_queue_job($job_id);
        return;
    }

    // Get actions array
    $actions = json_decode($workflow['actions'], true) ?: [];
    $action = $actions[$step_index] ?? null;

    if (!$action) {
        echo "[automation-worker] No action at step $step_index, marking run complete.\n";
        mark_run_complete($run_id);
        delete_queue_job($job_id);
        return;
    }

    // Get trigger payload
    $payload = json_decode($run['trigger_data'], true) ?: [];

    try {
        // Execute the action
        $result = execute_action($action, $payload);

        $execution_time = (int)((microtime(true) - $start_time) * 1000);

        // Log success
        log_automation_event(
            (int)$workflow['id'],
            $run_id,
            $action['type'],
            $action,
            'success',
            $result,
            null,
            $execution_time
        );

        // Append result to run
        append_result($run_id, $result);

        // Queue next step
        queue_next_action($job, $workflow, $run);

        // Mark this job as success and delete
        $db->prepare("UPDATE automation_queue SET status = 'success', completed_at = NOW() WHERE id = ?")
           ->execute([$job_id]);
        delete_queue_job($job_id);

        $stats['jobs_succeeded']++;
        echo "[automation-worker] Job #$job_id completed successfully ({$action['type']}, {$execution_time}ms).\n";

    } catch (Exception $e) {
        $execution_time = (int)((microtime(true) - $start_time) * 1000);
        $error_message = $e->getMessage();

        // Log failure
        log_automation_event(
            (int)$workflow['id'],
            $run_id,
            $action['type'],
            $action,
            'failed',
            null,
            $error_message,
            $execution_time
        );

        // Handle failure (retry or mark as failed)
        handle_action_failure($job, $error_message);

        $stats['jobs_failed']++;
        echo "[automation-worker] Job #$job_id failed: $error_message\n";
    }
}

/**
 * Print worker statistics.
 */
function print_stats(array $stats): void {
    echo "\n===== Worker Statistics =====\n";
    echo "Started: {$stats['started_at']}\n";
    echo "Jobs Processed: {$stats['jobs_processed']}\n";
    echo "Jobs Succeeded: {$stats['jobs_succeeded']}\n";
    echo "Jobs Failed: {$stats['jobs_failed']}\n";
    if ($stats['jobs_processed'] > 0) {
        $success_rate = round(($stats['jobs_succeeded'] / $stats['jobs_processed']) * 100, 1);
        echo "Success Rate: {$success_rate}%\n";
    }
    echo "=============================\n";
}
