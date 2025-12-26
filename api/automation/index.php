<?php
/**
 * FanzDash Automation Engine - API Endpoints
 * Version: 1.0.0
 *
 * REST API for managing automation workflows.
 * Route via your web server as /api/automation/
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/core.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get action from query string or POST body
$action = $_GET['action'] ?? $_POST['action'] ?? null;

try {
    switch ($action) {
        case 'list-workflows':
            list_workflows();
            break;

        case 'get-workflow':
            get_workflow();
            break;

        case 'save-workflow':
            save_workflow();
            break;

        case 'delete-workflow':
            delete_workflow();
            break;

        case 'toggle-workflow':
            toggle_workflow();
            break;

        case 'list-runs':
            list_runs();
            break;

        case 'get-run':
            get_run();
            break;

        case 'test-dispatch':
            test_dispatch();
            break;

        case 'list-logs':
            list_logs();
            break;

        case 'stats':
            get_stats();
            break;

        default:
            echo json_encode([
                'error' => 'Unknown action',
                'available_actions' => [
                    'list-workflows',
                    'get-workflow',
                    'save-workflow',
                    'delete-workflow',
                    'toggle-workflow',
                    'list-runs',
                    'get-run',
                    'test-dispatch',
                    'list-logs',
                    'stats'
                ]
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// ============================================
// WORKFLOW ENDPOINTS
// ============================================

/**
 * GET /api/automation/?action=list-workflows
 * Optional params: pack, platform, is_active
 */
function list_workflows(): void {
    $db = get_db();

    $where = [];
    $params = [];

    // Filter by pack
    if (!empty($_GET['pack'])) {
        $where[] = "pack = ?";
        $params[] = $_GET['pack'];
    }

    // Filter by platform
    if (!empty($_GET['platform'])) {
        $where[] = "platform = ?";
        $params[] = $_GET['platform'];
    }

    // Filter by active status
    if (isset($_GET['is_active'])) {
        $where[] = "is_active = ?";
        $params[] = (int)$_GET['is_active'];
    }

    $sql = "SELECT * FROM automation_workflows";
    if ($where) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    $sql .= " ORDER BY id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $workflows = $stmt->fetchAll();

    // Decode JSON fields
    foreach ($workflows as &$wf) {
        $wf['trigger_condition'] = $wf['trigger_condition']
            ? json_decode($wf['trigger_condition'], true)
            : null;
        $wf['actions'] = $wf['actions']
            ? json_decode($wf['actions'], true)
            : [];
    }

    echo json_encode([
        'success' => true,
        'workflows' => $workflows,
        'count' => count($workflows)
    ]);
}

/**
 * GET /api/automation/?action=get-workflow&id=123
 */
function get_workflow(): void {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        echo json_encode(['error' => 'Missing id parameter']);
        return;
    }

    $db = get_db();
    $stmt = $db->prepare("SELECT * FROM automation_workflows WHERE id = ?");
    $stmt->execute([$id]);
    $wf = $stmt->fetch();

    if (!$wf) {
        echo json_encode(['error' => 'Workflow not found']);
        return;
    }

    // Decode JSON fields
    $wf['trigger_condition'] = $wf['trigger_condition']
        ? json_decode($wf['trigger_condition'], true)
        : null;
    $wf['actions'] = $wf['actions']
        ? json_decode($wf['actions'], true)
        : [];

    echo json_encode([
        'success' => true,
        'workflow' => $wf
    ]);
}

/**
 * POST /api/automation/?action=save-workflow
 * Body: { name, description, pack, platform, trigger_event, trigger_condition, actions, id? }
 */
function save_workflow(): void {
    $db = get_db();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];

    $id = $data['id'] ?? null;
    $name = trim($data['name'] ?? '');
    $description = trim($data['description'] ?? '');
    $pack = trim($data['pack'] ?? '');
    $platform = trim($data['platform'] ?? 'global');
    $trigger_event = trim($data['trigger_event'] ?? '');
    $trigger_condition = $data['trigger_condition'] ?? null;
    $actions = $data['actions'] ?? [];
    $created_by = $data['created_by'] ?? 1; // TODO: get from auth

    // Validation
    if (!$name) {
        echo json_encode(['error' => 'Name is required']);
        return;
    }
    if (!$trigger_event) {
        echo json_encode(['error' => 'Trigger event is required']);
        return;
    }
    if (empty($actions) || !is_array($actions)) {
        echo json_encode(['error' => 'At least one action is required']);
        return;
    }

    // Validate actions have type
    foreach ($actions as $i => $action) {
        if (empty($action['type'])) {
            echo json_encode(['error' => "Action at index $i is missing type"]);
            return;
        }
    }

    if ($id) {
        // Update existing workflow
        $stmt = $db->prepare(
            "UPDATE automation_workflows
             SET name = ?,
                 description = ?,
                 pack = ?,
                 platform = ?,
                 trigger_event = ?,
                 trigger_condition = ?,
                 actions = ?
             WHERE id = ?"
        );
        $stmt->execute([
            $name,
            $description ?: null,
            $pack ?: null,
            $platform ?: 'global',
            $trigger_event,
            $trigger_condition ? json_encode($trigger_condition) : null,
            json_encode($actions),
            $id
        ]);
    } else {
        // Create new workflow
        $stmt = $db->prepare(
            "INSERT INTO automation_workflows
             (name, description, pack, platform, trigger_event, trigger_condition, actions, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $name,
            $description ?: null,
            $pack ?: null,
            $platform ?: 'global',
            $trigger_event,
            $trigger_condition ? json_encode($trigger_condition) : null,
            json_encode($actions),
            $created_by
        ]);
        $id = (int)$db->lastInsertId();
    }

    echo json_encode([
        'success' => true,
        'id' => (int)$id,
        'message' => 'Workflow saved successfully'
    ]);
}

/**
 * POST /api/automation/?action=delete-workflow
 * Body: { id }
 */
function delete_workflow(): void {
    $db = get_db();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = (int)($data['id'] ?? 0);

    if (!$id) {
        echo json_encode(['error' => 'Missing id']);
        return;
    }

    // Delete workflow (cascades to runs and queue via FK)
    $stmt = $db->prepare("DELETE FROM automation_workflows WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Workflow deleted'
    ]);
}

/**
 * POST /api/automation/?action=toggle-workflow
 * Body: { id, is_active }
 */
function toggle_workflow(): void {
    $db = get_db();
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $id = (int)($data['id'] ?? 0);
    $is_active = isset($data['is_active']) ? (int)$data['is_active'] : null;

    if (!$id) {
        echo json_encode(['error' => 'Missing id']);
        return;
    }

    if ($is_active === null) {
        // Toggle current state
        $stmt = $db->prepare("SELECT is_active FROM automation_workflows WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        $is_active = $row ? (1 - (int)$row['is_active']) : 0;
    }

    $stmt = $db->prepare("UPDATE automation_workflows SET is_active = ? WHERE id = ?");
    $stmt->execute([$is_active, $id]);

    echo json_encode([
        'success' => true,
        'is_active' => (bool)$is_active
    ]);
}

// ============================================
// RUN ENDPOINTS
// ============================================

/**
 * GET /api/automation/?action=list-runs
 * Optional params: workflow_id, status, limit
 */
function list_runs(): void {
    $db = get_db();
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));

    $where = [];
    $params = [];

    if (!empty($_GET['workflow_id'])) {
        $where[] = "ar.workflow_id = ?";
        $params[] = (int)$_GET['workflow_id'];
    }

    if (!empty($_GET['status'])) {
        $where[] = "ar.status = ?";
        $params[] = $_GET['status'];
    }

    $sql = "SELECT ar.*, aw.name AS workflow_name, aw.trigger_event
            FROM automation_runs ar
            JOIN automation_workflows aw ON aw.id = ar.workflow_id";

    if ($where) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }

    $sql .= " ORDER BY ar.id DESC LIMIT ?";
    $params[] = $limit;

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $runs = $stmt->fetchAll();

    // Decode JSON fields
    foreach ($runs as &$run) {
        $run['trigger_data'] = $run['trigger_data']
            ? json_decode($run['trigger_data'], true)
            : null;
        $run['result_data'] = $run['result_data']
            ? json_decode($run['result_data'], true)
            : null;
    }

    echo json_encode([
        'success' => true,
        'runs' => $runs,
        'count' => count($runs)
    ]);
}

/**
 * GET /api/automation/?action=get-run&id=123
 */
function get_run(): void {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        echo json_encode(['error' => 'Missing id']);
        return;
    }

    $db = get_db();
    $stmt = $db->prepare(
        "SELECT ar.*, aw.name AS workflow_name, aw.trigger_event, aw.actions AS workflow_actions
         FROM automation_runs ar
         JOIN automation_workflows aw ON aw.id = ar.workflow_id
         WHERE ar.id = ?"
    );
    $stmt->execute([$id]);
    $run = $stmt->fetch();

    if (!$run) {
        echo json_encode(['error' => 'Run not found']);
        return;
    }

    // Decode JSON fields
    $run['trigger_data'] = $run['trigger_data']
        ? json_decode($run['trigger_data'], true)
        : null;
    $run['result_data'] = $run['result_data']
        ? json_decode($run['result_data'], true)
        : null;
    $run['workflow_actions'] = $run['workflow_actions']
        ? json_decode($run['workflow_actions'], true)
        : [];

    // Get queue items for this run
    $stmt = $db->prepare(
        "SELECT * FROM automation_queue WHERE workflow_run_id = ? ORDER BY action_step_index"
    );
    $stmt->execute([$id]);
    $run['queue_items'] = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'run' => $run
    ]);
}

// ============================================
// TEST DISPATCH ENDPOINT
// ============================================

/**
 * POST /api/automation/?action=test-dispatch
 * Body: { event, payload }
 *
 * Fire a test event into the automation system.
 */
function test_dispatch(): void {
    require_once __DIR__ . '/core.php';

    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $event = $data['event'] ?? null;
    $payload = $data['payload'] ?? null;

    if (!$event) {
        echo json_encode(['error' => 'Event name is required']);
        return;
    }
    if (!is_array($payload)) {
        echo json_encode(['error' => 'Payload must be an object']);
        return;
    }

    // Add test marker
    $payload['_test'] = true;
    $payload['_test_at'] = date('c');

    $triggered = dispatch_event($event, $payload);

    echo json_encode([
        'success' => true,
        'event' => $event,
        'payload' => $payload,
        'workflows_triggered' => $triggered,
        'message' => $triggered > 0
            ? "$triggered workflow(s) triggered. Check Recent Runs."
            : "No matching active workflows found for this event."
    ]);
}

// ============================================
// LOGS ENDPOINT
// ============================================

/**
 * GET /api/automation/?action=list-logs
 * Optional params: workflow_id, run_id, action_type, limit
 */
function list_logs(): void {
    $db = get_db();
    $limit = min(200, max(1, (int)($_GET['limit'] ?? 100)));

    $where = [];
    $params = [];

    if (!empty($_GET['workflow_id'])) {
        $where[] = "workflow_id = ?";
        $params[] = (int)$_GET['workflow_id'];
    }

    if (!empty($_GET['run_id'])) {
        $where[] = "run_id = ?";
        $params[] = (int)$_GET['run_id'];
    }

    if (!empty($_GET['action_type'])) {
        $where[] = "action_type = ?";
        $params[] = $_GET['action_type'];
    }

    $sql = "SELECT * FROM automation_logs";
    if ($where) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    $sql .= " ORDER BY id DESC LIMIT ?";
    $params[] = $limit;

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();

    // Decode JSON fields
    foreach ($logs as &$log) {
        $log['action_data'] = $log['action_data']
            ? json_decode($log['action_data'], true)
            : null;
        $log['result_data'] = $log['result_data']
            ? json_decode($log['result_data'], true)
            : null;
    }

    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'count' => count($logs)
    ]);
}

// ============================================
// STATS ENDPOINT
// ============================================

/**
 * GET /api/automation/?action=stats
 *
 * Get automation system statistics.
 */
function get_stats(): void {
    $db = get_db();

    // Total workflows
    $stmt = $db->query("SELECT COUNT(*) as total, SUM(is_active) as active FROM automation_workflows");
    $workflows = $stmt->fetch();

    // Runs by status (last 24h)
    $stmt = $db->query(
        "SELECT status, COUNT(*) as count
         FROM automation_runs
         WHERE run_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         GROUP BY status"
    );
    $runs_by_status = [];
    while ($row = $stmt->fetch()) {
        $runs_by_status[$row['status']] = (int)$row['count'];
    }

    // Queue status
    $stmt = $db->query(
        "SELECT status, COUNT(*) as count
         FROM automation_queue
         GROUP BY status"
    );
    $queue_by_status = [];
    while ($row = $stmt->fetch()) {
        $queue_by_status[$row['status']] = (int)$row['count'];
    }

    // Top triggers (last 7 days)
    $stmt = $db->query(
        "SELECT aw.trigger_event, COUNT(*) as count
         FROM automation_runs ar
         JOIN automation_workflows aw ON aw.id = ar.workflow_id
         WHERE ar.run_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY aw.trigger_event
         ORDER BY count DESC
         LIMIT 10"
    );
    $top_triggers = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'stats' => [
            'workflows' => [
                'total' => (int)$workflows['total'],
                'active' => (int)$workflows['active']
            ],
            'runs_24h' => $runs_by_status,
            'queue' => $queue_by_status,
            'top_triggers_7d' => $top_triggers
        ]
    ]);
}
