<?php
/**
 * FanzDash Automation Engine - Core Logic
 * Version: 1.0.0
 *
 * Core automation dispatcher and helper functions.
 * This is the brain of the automation system.
 */

require_once __DIR__ . '/db.php';

/**
 * Dispatch an internal event into the automation engine.
 *
 * Call this from your existing code whenever something happens:
 *   dispatch_event('subscription.started', ['user_id' => 123, 'price' => 39.99]);
 *
 * @param string $event_name The event identifier (e.g., 'user.created')
 * @param array $payload The event data
 * @return int Number of workflows triggered
 */
function dispatch_event(string $event_name, array $payload): int {
    $db = get_db();
    $triggered = 0;

    // Add metadata to payload
    $payload['_event'] = $event_name;
    $payload['_timestamp'] = date('c');

    // Find all active workflows for this event
    $stmt = $db->prepare(
        "SELECT * FROM automation_workflows
         WHERE trigger_event = ? AND is_active = 1"
    );
    $stmt->execute([$event_name]);
    $workflows = $stmt->fetchAll();

    foreach ($workflows as $wf) {
        // Parse and evaluate conditions
        $conditions = $wf['trigger_condition']
            ? json_decode($wf['trigger_condition'], true)
            : null;

        if (!evaluate_condition($conditions, $payload)) {
            continue;
        }

        // Create run record
        $stmt = $db->prepare(
            "INSERT INTO automation_runs (workflow_id, trigger_data, status)
             VALUES (?, ?, 'pending')"
        );
        $stmt->execute([$wf['id'], json_encode($payload)]);
        $run_id = (int)$db->lastInsertId();

        // Queue first action step (index 0)
        $stmt = $db->prepare(
            "INSERT INTO automation_queue (workflow_run_id, action_step_index, status)
             VALUES (?, 0, 'queued')"
        );
        $stmt->execute([$run_id]);

        // Log the dispatch
        log_automation_event($wf['id'], $run_id, 'dispatch', [
            'event' => $event_name,
            'workflow_name' => $wf['name']
        ], 'success');

        $triggered++;
    }

    return $triggered;
}

/**
 * Evaluate trigger conditions against payload.
 *
 * Condition format:
 * {
 *   "price": { "gt": 29 },
 *   "country": { "eq": "US" }
 * }
 *
 * Supported operators: eq, neq, gt, gte, lt, lte, contains, in
 *
 * @param array|null $conditions The conditions to evaluate
 * @param array $payload The payload to check against
 * @return bool True if all conditions pass (or no conditions)
 */
function evaluate_condition(?array $conditions, array $payload): bool {
    if (!$conditions || empty($conditions)) {
        return true;
    }

    foreach ($conditions as $field => $rules) {
        $value = get_nested_value($payload, $field);

        foreach ($rules as $op => $target) {
            switch ($op) {
                case 'eq':
                    if ($value != $target) return false;
                    break;
                case 'neq':
                    if ($value == $target) return false;
                    break;
                case 'gt':
                    if (!is_numeric($value) || $value <= $target) return false;
                    break;
                case 'gte':
                    if (!is_numeric($value) || $value < $target) return false;
                    break;
                case 'lt':
                    if (!is_numeric($value) || $value >= $target) return false;
                    break;
                case 'lte':
                    if (!is_numeric($value) || $value > $target) return false;
                    break;
                case 'contains':
                    if (!is_string($value) || strpos($value, $target) === false) return false;
                    break;
                case 'in':
                    if (!is_array($target) || !in_array($value, $target)) return false;
                    break;
                case 'exists':
                    if ($target === true && $value === null) return false;
                    if ($target === false && $value !== null) return false;
                    break;
            }
        }
    }

    return true;
}

/**
 * Get a nested value from an array using dot notation.
 *
 * @param array $array The array to search
 * @param string $key The key (supports dot notation: "user.email")
 * @return mixed The value or null
 */
function get_nested_value(array $array, string $key) {
    $keys = explode('.', $key);
    $value = $array;

    foreach ($keys as $k) {
        if (!is_array($value) || !isset($value[$k])) {
            return null;
        }
        $value = $value[$k];
    }

    return $value;
}

/**
 * Fetch a run by ID.
 */
function fetch_run(int $run_id): ?array {
    $db = get_db();
    $stmt = $db->prepare("SELECT * FROM automation_runs WHERE id = ?");
    $stmt->execute([$run_id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/**
 * Fetch a workflow by ID.
 */
function fetch_workflow(int $wf_id): ?array {
    $db = get_db();
    $stmt = $db->prepare("SELECT * FROM automation_workflows WHERE id = ?");
    $stmt->execute([$wf_id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/**
 * Mark a run as complete.
 */
function mark_run_complete(int $run_id): void {
    $db = get_db();
    $stmt = $db->prepare(
        "UPDATE automation_runs
         SET status = 'success', completed_at = NOW()
         WHERE id = ?"
    );
    $stmt->execute([$run_id]);
}

/**
 * Mark a run as failed.
 */
function mark_run_failed(int $run_id, string $error_message): void {
    $db = get_db();
    $stmt = $db->prepare(
        "UPDATE automation_runs
         SET status = 'failed', error_message = ?, completed_at = NOW()
         WHERE id = ?"
    );
    $stmt->execute([$error_message, $run_id]);
}

/**
 * Delete a queue job after completion.
 */
function delete_queue_job(int $job_id): void {
    $db = get_db();
    $stmt = $db->prepare("DELETE FROM automation_queue WHERE id = ?");
    $stmt->execute([$job_id]);
}

/**
 * Append a result to the run's result_data array.
 */
function append_result(int $run_id, array $result): void {
    $db = get_db();

    // Get existing results
    $stmt = $db->prepare("SELECT result_data FROM automation_runs WHERE id = ?");
    $stmt->execute([$run_id]);
    $row = $stmt->fetch();

    $existing = $row && $row['result_data']
        ? json_decode($row['result_data'], true)
        : [];

    $result['_executed_at'] = date('c');
    $existing[] = $result;

    // Update with new results
    $stmt = $db->prepare("UPDATE automation_runs SET result_data = ? WHERE id = ?");
    $stmt->execute([json_encode($existing), $run_id]);
}

/**
 * Queue the next action step in a workflow.
 */
function queue_next_action(array $job, array $workflow, array $run): void {
    $db = get_db();
    $actions = json_decode($workflow['actions'], true) ?: [];
    $next_index = $job['action_step_index'] + 1;

    // Check if there's another action
    if (!isset($actions[$next_index])) {
        mark_run_complete((int)$run['id']);
        return;
    }

    $next_action = $actions[$next_index];
    $delay_seconds = 0;

    // Check if next action is a delay
    if ($next_action['type'] === 'delay' && isset($next_action['seconds'])) {
        $delay_seconds = (int)$next_action['seconds'];
    }

    // Queue the next step
    $stmt = $db->prepare(
        "INSERT INTO automation_queue (workflow_run_id, action_step_index, next_attempt_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))"
    );
    $stmt->execute([(int)$run['id'], $next_index, $delay_seconds]);
}

/**
 * Handle action failure with retry logic.
 */
function handle_action_failure(array $job, string $error_message): void {
    $db = get_db();
    $max_retries = $job['max_retries'] ?? 3;

    if ($job['retry_count'] >= $max_retries) {
        // Mark job as failed
        $stmt = $db->prepare(
            "UPDATE automation_queue
             SET status = 'failed', error_message = ?, completed_at = NOW()
             WHERE id = ?"
        );
        $stmt->execute([$error_message, $job['id']]);

        // Mark run as failed
        mark_run_failed((int)$job['workflow_run_id'], "Action step {$job['action_step_index']} failed after {$max_retries} retries: $error_message");
        return;
    }

    // Exponential backoff: 20s, 40s, 80s...
    $retry_count = $job['retry_count'] + 1;
    $backoff_seconds = pow(2, $retry_count) * 10;

    $stmt = $db->prepare(
        "UPDATE automation_queue
         SET status = 'queued',
             retry_count = ?,
             error_message = ?,
             next_attempt_at = DATE_ADD(NOW(), INTERVAL ? SECOND)
         WHERE id = ?"
    );
    $stmt->execute([$retry_count, $error_message, $backoff_seconds, $job['id']]);

    // Log the retry
    log_automation_event(null, (int)$job['workflow_run_id'], 'retry', [
        'step_index' => $job['action_step_index'],
        'retry_count' => $retry_count,
        'backoff_seconds' => $backoff_seconds,
        'error' => $error_message
    ], 'warning');
}

/**
 * Log an automation event for audit trail.
 */
function log_automation_event(
    ?int $workflow_id,
    ?int $run_id,
    string $action_type,
    ?array $action_data,
    string $result_status,
    ?array $result_data = null,
    ?string $error_message = null,
    ?int $execution_time_ms = null
): void {
    $db = get_db();

    try {
        $stmt = $db->prepare(
            "INSERT INTO automation_logs
             (workflow_id, run_id, action_type, action_data, result_status, result_data, error_message, execution_time_ms)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $workflow_id,
            $run_id,
            $action_type,
            $action_data ? json_encode($action_data) : null,
            $result_status,
            $result_data ? json_encode($result_data) : null,
            $error_message,
            $execution_time_ms
        ]);
    } catch (Exception $e) {
        error_log("Failed to log automation event: " . $e->getMessage());
    }
}

/**
 * Replace {var} placeholders with payload values.
 *
 * @param string $str The string with placeholders
 * @param array $payload The payload with values
 * @return string The string with replaced values
 */
function replace_vars(string $str, array $payload): string {
    return preg_replace_callback('/\{([^}]+)\}/', function($matches) use ($payload) {
        $key = $matches[1];
        $value = get_nested_value($payload, $key);

        if ($value === null) {
            return '';
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        return (string)$value;
    }, $str);
}
