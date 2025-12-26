<?php
/**
 * FanzDash Automation Engine - Action Handlers
 * Version: 1.0.0
 *
 * All automation action handlers.
 * Wire these into your existing email/notification systems.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/core.php';

/**
 * Main action router.
 * Routes action to appropriate handler based on type.
 *
 * @param array $action The action configuration
 * @param array $payload The trigger payload
 * @return array The action result
 * @throws Exception If action fails
 */
function execute_action(array $action, array $payload): array {
    $type = $action['type'] ?? null;

    if (!$type) {
        throw new Exception("Action type is required");
    }

    switch ($type) {
        case 'send_email':
            return send_email_action($action, $payload);

        case 'send_webhook':
            return send_webhook_action($action, $payload);

        case 'delay':
            return delay_action($action);

        case 'db_write':
            return db_write_action($action, $payload);

        case 'db_update':
            return db_update_action($action, $payload);

        case 'admin_notify':
            return admin_notify_action($action, $payload);

        case 'creator_notify':
            return creator_notify_action($action, $payload);

        case 'send_dm':
            return send_dm_action($action, $payload);

        case 'tag_user':
            return tag_user_action($action, $payload);

        case 'tag_creator':
            return tag_creator_action($action, $payload);

        case 'assign_ticket':
            return assign_ticket_action($action, $payload);

        case 'trigger_payout':
            return trigger_payout_action($action, $payload);

        case 'custom_code':
            return custom_code_action($action, $payload);

        default:
            throw new Exception("Unknown action type: $type");
    }
}

// ============================================
// EMAIL ACTIONS
// ============================================

/**
 * Send Email Action
 *
 * $action config:
 * {
 *   "type": "send_email",
 *   "to": "{user_email}",
 *   "template": "welcome_premium",
 *   "subject": "Welcome!", // optional override
 *   "data": {} // optional extra template data
 * }
 */
function send_email_action(array $action, array $payload): array {
    $to = replace_vars($action['to'] ?? '', $payload);
    $template = $action['template'] ?? 'default';
    $subject = isset($action['subject']) ? replace_vars($action['subject'], $payload) : null;
    $extra_data = $action['data'] ?? [];

    if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address: $to");
    }

    // Merge payload with extra data for template
    $template_data = array_merge($payload, $extra_data);

    // TODO: Hook into your actual email system
    // Example integrations:
    // - send_template_email($to, $template, $template_data, $subject);
    // - $mailer->send($to, $template, $template_data);
    // - SendGrid::send($to, $template, $template_data);

    // For now, log the email intent
    error_log("[FanzDash Automation] Send email to: $to, template: $template");

    return [
        'type' => 'send_email',
        'to' => $to,
        'template' => $template,
        'subject' => $subject,
        'status' => 'queued'
    ];
}

// ============================================
// WEBHOOK ACTIONS
// ============================================

/**
 * Send Webhook Action
 *
 * $action config:
 * {
 *   "type": "send_webhook",
 *   "url": "https://api.example.com/endpoint",
 *   "method": "POST", // optional, default POST
 *   "headers": {}, // optional
 *   "body": { "key": "{value}" }
 * }
 */
function send_webhook_action(array $action, array $payload): array {
    $url = $action['url'] ?? null;
    $method = strtoupper($action['method'] ?? 'POST');
    $headers = $action['headers'] ?? [];
    $body = $action['body'] ?? [];

    if (!$url) {
        throw new Exception("Webhook URL is required");
    }

    // Replace variables in body
    $body_json = replace_vars(json_encode($body), $payload);

    // Set default headers
    $default_headers = [
        'Content-Type: application/json',
        'User-Agent: FanzDash-Automation/1.0'
    ];

    // Merge custom headers
    $all_headers = $default_headers;
    foreach ($headers as $key => $value) {
        $all_headers[] = "$key: " . replace_vars($value, $payload);
    }

    // Make the request
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $all_headers,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body_json);
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body_json);
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        throw new Exception("Webhook error: $curl_error");
    }

    if ($http_code >= 400) {
        throw new Exception("Webhook returned HTTP $http_code: " . substr($response, 0, 500));
    }

    return [
        'type' => 'send_webhook',
        'url' => $url,
        'method' => $method,
        'http_code' => $http_code,
        'response' => substr($response, 0, 1000) // Truncate long responses
    ];
}

// ============================================
// DELAY ACTION
// ============================================

/**
 * Delay Action
 *
 * $action config:
 * {
 *   "type": "delay",
 *   "seconds": 86400 // 24 hours
 * }
 *
 * Note: Actual delay is handled by queue_next_action()
 */
function delay_action(array $action): array {
    $seconds = (int)($action['seconds'] ?? 0);

    return [
        'type' => 'delay',
        'seconds' => $seconds,
        'human_readable' => format_duration($seconds),
        'status' => 'scheduled'
    ];
}

/**
 * Format seconds as human-readable duration.
 */
function format_duration(int $seconds): string {
    if ($seconds < 60) return "$seconds seconds";
    if ($seconds < 3600) return round($seconds / 60) . " minutes";
    if ($seconds < 86400) return round($seconds / 3600, 1) . " hours";
    return round($seconds / 86400, 1) . " days";
}

// ============================================
// DATABASE ACTIONS
// ============================================

/**
 * DB Write Action (INSERT)
 *
 * $action config:
 * {
 *   "type": "db_write",
 *   "table": "notifications",
 *   "data": {
 *     "user_id": "{user_id}",
 *     "message": "Welcome!",
 *     "type": "system"
 *   }
 * }
 */
function db_write_action(array $action, array $payload): array {
    $db = get_db();
    $table = $action['table'] ?? null;
    $data = $action['data'] ?? null;

    if (!$table || !$data || !is_array($data)) {
        throw new Exception("db_write requires table and data");
    }

    // Sanitize table name (prevent SQL injection)
    if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $table)) {
        throw new Exception("Invalid table name");
    }

    // Replace vars in values
    $cols = array_keys($data);
    $vals = array_map(function($v) use ($payload) {
        if (is_string($v)) return replace_vars($v, $payload);
        return $v;
    }, array_values($data));

    $placeholders = implode(',', array_fill(0, count($cols), '?'));
    $col_list = implode(',', array_map(fn($c) => "`$c`", $cols));

    $sql = "INSERT INTO `$table` ($col_list) VALUES ($placeholders)";
    $stmt = $db->prepare($sql);
    $stmt->execute($vals);

    return [
        'type' => 'db_write',
        'table' => $table,
        'insert_id' => $db->lastInsertId(),
        'status' => 'inserted'
    ];
}

/**
 * DB Update Action
 *
 * $action config:
 * {
 *   "type": "db_update",
 *   "table": "users",
 *   "set": { "status": "premium" },
 *   "where": { "id": "{user_id}" }
 * }
 */
function db_update_action(array $action, array $payload): array {
    $db = get_db();
    $table = $action['table'] ?? null;
    $set_data = $action['set'] ?? null;
    $where_data = $action['where'] ?? null;

    if (!$table || !$set_data || !$where_data) {
        throw new Exception("db_update requires table, set, and where");
    }

    // Sanitize table name
    if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $table)) {
        throw new Exception("Invalid table name");
    }

    // Build SET clause
    $set_parts = [];
    $set_vals = [];
    foreach ($set_data as $col => $val) {
        $set_parts[] = "`$col` = ?";
        $set_vals[] = is_string($val) ? replace_vars($val, $payload) : $val;
    }

    // Build WHERE clause
    $where_parts = [];
    $where_vals = [];
    foreach ($where_data as $col => $val) {
        $where_parts[] = "`$col` = ?";
        $where_vals[] = is_string($val) ? replace_vars($val, $payload) : $val;
    }

    $sql = "UPDATE `$table` SET " . implode(', ', $set_parts) .
           " WHERE " . implode(' AND ', $where_parts);

    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge($set_vals, $where_vals));

    return [
        'type' => 'db_update',
        'table' => $table,
        'rows_affected' => $stmt->rowCount(),
        'status' => 'updated'
    ];
}

// ============================================
// NOTIFICATION ACTIONS
// ============================================

/**
 * Admin Notify Action
 *
 * $action config:
 * {
 *   "type": "admin_notify",
 *   "message": "New high-value subscriber: {user_email}",
 *   "level": "info" // info, warning, error
 * }
 */
function admin_notify_action(array $action, array $payload): array {
    $message = replace_vars($action['message'] ?? '', $payload);
    $level = $action['level'] ?? 'info';

    // TODO: Integrate with your admin notifications system
    // Example:
    // - Insert into admin_notifications table
    // - Push to admin dashboard WebSocket
    // - Send Slack/Discord webhook

    $db = get_db();

    // Try to insert into notifications table if it exists
    try {
        $stmt = $db->prepare(
            "INSERT INTO admin_notifications (message, level, created_at)
             VALUES (?, ?, NOW())"
        );
        $stmt->execute([$message, $level]);
    } catch (Exception $e) {
        // Table might not exist - just log
        error_log("[FanzDash Automation] Admin notify: [$level] $message");
    }

    return [
        'type' => 'admin_notify',
        'message' => $message,
        'level' => $level,
        'status' => 'notified'
    ];
}

/**
 * Creator Notify Action
 *
 * $action config:
 * {
 *   "type": "creator_notify",
 *   "message": "You have a new custom request from {user_name}!"
 * }
 */
function creator_notify_action(array $action, array $payload): array {
    $creator_id = $payload['creator_id'] ?? null;
    $message = replace_vars($action['message'] ?? '', $payload);

    if (!$creator_id) {
        throw new Exception("creator_id missing in payload");
    }

    // TODO: Integrate with your creator notification system
    // Example:
    // - Insert into creator_notifications table
    // - Push to creator dashboard
    // - Send push notification

    $db = get_db();

    try {
        $stmt = $db->prepare(
            "INSERT INTO creator_notifications (creator_id, message, created_at)
             VALUES (?, ?, NOW())"
        );
        $stmt->execute([$creator_id, $message]);
    } catch (Exception $e) {
        error_log("[FanzDash Automation] Creator notify ($creator_id): $message");
    }

    return [
        'type' => 'creator_notify',
        'creator_id' => $creator_id,
        'message' => $message,
        'status' => 'notified'
    ];
}

/**
 * Send DM Action
 *
 * $action config:
 * {
 *   "type": "send_dm",
 *   "to_user_id": "{user_id}",
 *   "from_type": "system", // system, creator, admin
 *   "message": "Welcome to the platform!"
 * }
 */
function send_dm_action(array $action, array $payload): array {
    $to_user_id = replace_vars($action['to_user_id'] ?? '', $payload);
    $from_type = $action['from_type'] ?? 'system';
    $message = replace_vars($action['message'] ?? '', $payload);

    if (!$to_user_id) {
        throw new Exception("to_user_id is required for send_dm");
    }

    // TODO: Integrate with your messaging system
    error_log("[FanzDash Automation] Send DM to user $to_user_id: $message");

    return [
        'type' => 'send_dm',
        'to_user_id' => $to_user_id,
        'from_type' => $from_type,
        'message' => substr($message, 0, 100) . '...',
        'status' => 'sent'
    ];
}

// ============================================
// TAGGING ACTIONS
// ============================================

/**
 * Tag User Action
 *
 * $action config:
 * {
 *   "type": "tag_user",
 *   "tag": "premium_subscriber"
 * }
 */
function tag_user_action(array $action, array $payload): array {
    $user_id = $payload['user_id'] ?? null;
    $tag = $action['tag'] ?? null;

    if (!$user_id || !$tag) {
        throw new Exception("tag_user requires user_id in payload and tag in action");
    }

    $db = get_db();

    try {
        $stmt = $db->prepare(
            "INSERT INTO user_tags (user_id, tag, created_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE created_at = NOW()"
        );
        $stmt->execute([$user_id, $tag]);
    } catch (Exception $e) {
        error_log("[FanzDash Automation] Tag user $user_id with: $tag");
    }

    return [
        'type' => 'tag_user',
        'user_id' => $user_id,
        'tag' => $tag,
        'status' => 'tagged'
    ];
}

/**
 * Tag Creator Action
 */
function tag_creator_action(array $action, array $payload): array {
    $creator_id = $payload['creator_id'] ?? null;
    $tag = $action['tag'] ?? null;

    if (!$creator_id || !$tag) {
        throw new Exception("tag_creator requires creator_id in payload and tag in action");
    }

    $db = get_db();

    try {
        $stmt = $db->prepare(
            "INSERT INTO creator_tags (creator_id, tag, created_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE created_at = NOW()"
        );
        $stmt->execute([$creator_id, $tag]);
    } catch (Exception $e) {
        error_log("[FanzDash Automation] Tag creator $creator_id with: $tag");
    }

    return [
        'type' => 'tag_creator',
        'creator_id' => $creator_id,
        'tag' => $tag,
        'status' => 'tagged'
    ];
}

// ============================================
// SUPPORT ACTIONS
// ============================================

/**
 * Assign Ticket Action
 *
 * $action config:
 * {
 *   "type": "assign_ticket",
 *   "assign_to": "support_team", // or specific admin ID
 *   "priority": "high"
 * }
 */
function assign_ticket_action(array $action, array $payload): array {
    $ticket_id = $payload['ticket_id'] ?? null;
    $assign_to = $action['assign_to'] ?? 'support_team';
    $priority = $action['priority'] ?? 'normal';

    if (!$ticket_id) {
        throw new Exception("ticket_id missing in payload");
    }

    // TODO: Integrate with your support ticket system
    error_log("[FanzDash Automation] Assign ticket $ticket_id to $assign_to (priority: $priority)");

    return [
        'type' => 'assign_ticket',
        'ticket_id' => $ticket_id,
        'assign_to' => $assign_to,
        'priority' => $priority,
        'status' => 'assigned'
    ];
}

// ============================================
// PAYOUT ACTIONS
// ============================================

/**
 * Trigger Payout Action
 *
 * $action config:
 * {
 *   "type": "trigger_payout",
 *   "auto_approve": false
 * }
 */
function trigger_payout_action(array $action, array $payload): array {
    $creator_id = $payload['creator_id'] ?? null;
    $amount = $payload['amount'] ?? null;
    $auto_approve = $action['auto_approve'] ?? false;

    if (!$creator_id) {
        throw new Exception("creator_id missing in payload");
    }

    // TODO: Integrate with your payout system
    // If auto_approve is true, process immediately
    // Otherwise, queue for manual review

    error_log("[FanzDash Automation] Trigger payout for creator $creator_id: $amount (auto_approve: " . ($auto_approve ? 'yes' : 'no') . ")");

    return [
        'type' => 'trigger_payout',
        'creator_id' => $creator_id,
        'amount' => $amount,
        'auto_approve' => $auto_approve,
        'status' => $auto_approve ? 'processing' : 'queued_for_review'
    ];
}

// ============================================
// CUSTOM CODE ACTION
// ============================================

/**
 * Custom Code Action
 *
 * SECURITY WARNING: Be very careful with this action.
 * Consider mapping keywords to predefined functions instead of eval.
 *
 * $action config:
 * {
 *   "type": "custom_code",
 *   "function": "calculate_loyalty_bonus" // maps to predefined function
 * }
 */
function custom_code_action(array $action, array $payload): array {
    $function_key = $action['function'] ?? null;

    if (!$function_key) {
        throw new Exception("custom_code requires function key");
    }

    // Map to predefined safe functions
    $allowed_functions = [
        'calculate_loyalty_bonus' => 'custom_calculate_loyalty_bonus',
        'update_referral_count' => 'custom_update_referral_count',
        'sync_external_crm' => 'custom_sync_external_crm',
    ];

    if (!isset($allowed_functions[$function_key])) {
        throw new Exception("Unknown custom function: $function_key");
    }

    $fn = $allowed_functions[$function_key];

    if (function_exists($fn)) {
        return $fn($payload);
    }

    return [
        'type' => 'custom_code',
        'function' => $function_key,
        'status' => 'skipped_not_implemented'
    ];
}

// Predefined custom functions
function custom_calculate_loyalty_bonus(array $payload): array {
    // Example: calculate and store loyalty bonus
    return ['type' => 'custom_code', 'function' => 'calculate_loyalty_bonus', 'status' => 'executed'];
}

function custom_update_referral_count(array $payload): array {
    // Example: update referral stats
    return ['type' => 'custom_code', 'function' => 'update_referral_count', 'status' => 'executed'];
}

function custom_sync_external_crm(array $payload): array {
    // Example: sync data to external CRM
    return ['type' => 'custom_code', 'function' => 'sync_external_crm', 'status' => 'executed'];
}
