<?php
/**
 * FanzDash Automation Engine - Log Cleanup Script
 * Version: 1.0.0
 *
 * Cleans up old automation logs and completed runs.
 * Run via cron or PM2 scheduler.
 *
 * Usage: php cleanup_logs.php [--days=30]
 */

require_once __DIR__ . '/db.php';

// Get days to keep from env or args
$days = (int)(getenv('CLEANUP_DAYS') ?: 30);

// Parse command line args
foreach ($argv as $arg) {
    if (preg_match('/^--days=(\d+)$/', $arg, $m)) {
        $days = (int)$m[1];
    }
}

echo "[cleanup] FanzDash Automation Log Cleanup\n";
echo "[cleanup] Removing records older than $days days\n";
echo "[cleanup] Started at: " . date('Y-m-d H:i:s') . "\n\n";

$db = get_db();

// Clean up old logs
$stmt = $db->prepare(
    "DELETE FROM automation_logs
     WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)"
);
$stmt->execute([$days]);
$logsDeleted = $stmt->rowCount();
echo "[cleanup] Deleted $logsDeleted log entries\n";

// Clean up old successful runs (keep failed ones longer)
$stmt = $db->prepare(
    "DELETE FROM automation_runs
     WHERE status = 'success'
       AND run_at < DATE_SUB(NOW(), INTERVAL ? DAY)"
);
$stmt->execute([$days]);
$runsDeleted = $stmt->rowCount();
echo "[cleanup] Deleted $runsDeleted successful run records\n";

// Clean up old queue jobs (orphaned or very old)
$stmt = $db->prepare(
    "DELETE FROM automation_queue
     WHERE (status IN ('success', 'failed') OR created_at < DATE_SUB(NOW(), INTERVAL ? DAY))
       AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
);
$stmt->execute([$days]);
$queueDeleted = $stmt->rowCount();
echo "[cleanup] Deleted $queueDeleted queue records\n";

// Optimize tables
echo "[cleanup] Optimizing tables...\n";
$db->exec("OPTIMIZE TABLE automation_logs");
$db->exec("OPTIMIZE TABLE automation_runs");
$db->exec("OPTIMIZE TABLE automation_queue");

echo "\n[cleanup] Done at: " . date('Y-m-d H:i:s') . "\n";
