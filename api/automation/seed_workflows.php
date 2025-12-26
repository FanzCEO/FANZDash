<?php
/**
 * FanzDash Automation Engine - Seed Preset Workflows
 * Version: 1.0.0
 *
 * Run this script to populate the database with ready-to-use automation packs.
 * Usage: php seed_workflows.php
 */

require_once __DIR__ . '/db.php';

echo "FanzDash Automation Seeder\n";
echo "==========================\n\n";

$db = get_db();

// Check if tables exist
try {
    $db->query("SELECT 1 FROM automation_workflows LIMIT 1");
} catch (Exception $e) {
    die("ERROR: automation_workflows table doesn't exist. Run migrations first.\n");
}

// Add pack and platform columns if they don't exist
try {
    $db->query("SELECT pack FROM automation_workflows LIMIT 1");
} catch (Exception $e) {
    echo "Adding pack and platform columns...\n";
    $db->exec("ALTER TABLE automation_workflows ADD COLUMN pack VARCHAR(100) NULL AFTER description");
    $db->exec("ALTER TABLE automation_workflows ADD COLUMN platform VARCHAR(100) DEFAULT 'global' AFTER pack");
}

// ============================================
// PRESET WORKFLOWS
// ============================================

$workflows = [
    // ======== ONBOARDING PACK ========
    [
        'name' => 'Onboarding: User Welcome',
        'description' => 'Send welcome email when a new user signs up',
        'pack' => 'onboarding',
        'platform' => 'global',
        'trigger_event' => 'user.created',
        'trigger_condition' => null,
        'actions' => [
            [
                'type' => 'send_email',
                'to' => '{user_email}',
                'template' => 'user_welcome'
            ]
        ]
    ],
    [
        'name' => 'Onboarding: Creator Verified Welcome',
        'description' => 'Welcome and notify admin when a creator is verified',
        'pack' => 'onboarding',
        'platform' => 'global',
        'trigger_event' => 'creator.verified',
        'trigger_condition' => null,
        'actions' => [
            [
                'type' => 'send_email',
                'to' => '{creator_email}',
                'template' => 'creator_verified_welcome'
            ],
            [
                'type' => 'admin_notify',
                'message' => 'New creator verified: {creator_name} (ID: {creator_id})',
                'level' => 'info'
            ]
        ]
    ],

    // ======== RETENTION PACK ========
    [
        'name' => 'Retention: High-Value Subscriber Welcome + Upsell',
        'description' => 'Welcome sequence for subscribers paying more than $29',
        'pack' => 'retention',
        'platform' => 'global',
        'trigger_event' => 'subscription.started',
        'trigger_condition' => ['price' => ['gt' => 29]],
        'actions' => [
            [
                'type' => 'send_email',
                'to' => '{user_email}',
                'template' => 'premium_welcome'
            ],
            [
                'type' => 'delay',
                'seconds' => 86400 // 24 hours
            ],
            [
                'type' => 'send_email',
                'to' => '{user_email}',
                'template' => 'premium_upsell_24h'
            ]
        ]
    ],
    [
        'name' => 'Retention: Churn Save - Subscription Cancelled',
        'description' => 'Send save offer when subscription is cancelled',
        'pack' => 'retention',
        'platform' => 'global',
        'trigger_event' => 'subscription.cancelled',
        'trigger_condition' => ['reason' => ['neq' => 'payment_failed']],
        'actions' => [
            [
                'type' => 'send_email',
                'to' => '{user_email}',
                'template' => 'sub_cancel_save_offer'
            ]
        ]
    ],
    [
        'name' => 'Retention: Payment Failed Winback',
        'description' => 'Recover failed payments with card update reminder',
        'pack' => 'retention',
        'platform' => 'global',
        'trigger_event' => 'subscription.cancelled',
        'trigger_condition' => ['reason' => ['eq' => 'payment_failed']],
        'actions' => [
            [
                'type' => 'send_email',
                'to' => '{user_email}',
                'template' => 'payment_failed_update_card'
            ]
        ]
    ],

    // ======== MODERATION PACK ========
    [
        'name' => 'Moderation: Content Flagged Alert',
        'description' => 'Alert mods and creator when content is flagged',
        'pack' => 'moderation',
        'platform' => 'global',
        'trigger_event' => 'content.flagged',
        'trigger_condition' => ['severity' => ['gt' => 0]],
        'actions' => [
            [
                'type' => 'admin_notify',
                'message' => 'Content {content_id} by creator {creator_id} flagged (severity {severity}). Reason: {reason}',
                'level' => 'warning'
            ],
            [
                'type' => 'creator_notify',
                'message' => 'Heads up: Your content {content_id} was flagged for review. Our team will check it shortly. Reason: {reason}'
            ]
        ]
    ],

    // ======== POD STORE PACK ========
    [
        'name' => 'POD: Auto-Send Order + Notify Admin',
        'description' => 'Send merch orders to POD provider and notify admin',
        'pack' => 'pod_store',
        'platform' => 'global',
        'trigger_event' => 'order.placed',
        'trigger_condition' => ['total_amount' => ['gt' => 0]],
        'actions' => [
            [
                'type' => 'send_webhook',
                'url' => 'https://api.printful.com/orders',
                'method' => 'POST',
                'body' => [
                    'external_id' => '{order_id}',
                    'recipient' => [
                        'name' => '{shipping_name}',
                        'address1' => '{shipping_addr1}',
                        'city' => '{shipping_city}',
                        'zip' => '{shipping_zip}',
                        'country_code' => '{shipping_country}'
                    ],
                    'items' => '{items}'
                ]
            ],
            [
                'type' => 'admin_notify',
                'message' => 'POD order {order_id} sent for user {user_id}, total {total_amount} {currency}',
                'level' => 'info'
            ]
        ]
    ],

    // ======== CREATOR OPS PACK ========
    [
        'name' => 'Creator Ops: Custom Request Notification',
        'description' => 'Notify creator and email fan when custom request is created',
        'pack' => 'creator_ops',
        'platform' => 'global',
        'trigger_event' => 'custom_request.created',
        'trigger_condition' => ['price' => ['gt' => 0]],
        'actions' => [
            [
                'type' => 'creator_notify',
                'message' => 'New custom request from {user_name} worth ${price}. Log in to review and respond.'
            ],
            [
                'type' => 'send_email',
                'to' => '{user_email}',
                'template' => 'custom_request_received'
            ],
            [
                'type' => 'delay',
                'seconds' => 86400 // 24 hours
            ],
            [
                'type' => 'admin_notify',
                'message' => 'Creator {creator_id} has an unanswered custom request {request_id} older than 24h',
                'level' => 'warning'
            ]
        ]
    ],
    [
        'name' => 'Creator Ops: Payout Notification',
        'description' => 'Notify admin and creator when payout is requested',
        'pack' => 'creator_ops',
        'platform' => 'global',
        'trigger_event' => 'payout.requested',
        'trigger_condition' => ['amount' => ['gt' => 0]],
        'actions' => [
            [
                'type' => 'admin_notify',
                'message' => 'Payout requested by creator {creator_id} for {amount} {currency}',
                'level' => 'info'
            ],
            [
                'type' => 'send_email',
                'to' => '{creator_email}',
                'template' => 'payout_requested'
            ]
        ]
    ]
];

// ============================================
// INSERT WORKFLOWS
// ============================================

$inserted = 0;
$skipped = 0;

foreach ($workflows as $wf) {
    // Check if workflow with same name exists
    $stmt = $db->prepare("SELECT id FROM automation_workflows WHERE name = ?");
    $stmt->execute([$wf['name']]);

    if ($stmt->fetch()) {
        echo "  SKIP: {$wf['name']} (already exists)\n";
        $skipped++;
        continue;
    }

    $stmt = $db->prepare(
        "INSERT INTO automation_workflows
         (name, description, pack, platform, trigger_event, trigger_condition, actions, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
    );

    $stmt->execute([
        $wf['name'],
        $wf['description'],
        $wf['pack'],
        $wf['platform'],
        $wf['trigger_event'],
        $wf['trigger_condition'] ? json_encode($wf['trigger_condition']) : null,
        json_encode($wf['actions'])
    ]);

    echo "  ADD: {$wf['name']}\n";
    $inserted++;
}

echo "\n";
echo "==========================\n";
echo "Done! Inserted: $inserted, Skipped: $skipped\n";
echo "\nWorkflows by Pack:\n";

$stmt = $db->query(
    "SELECT pack, COUNT(*) as count FROM automation_workflows GROUP BY pack"
);
while ($row = $stmt->fetch()) {
    $pack = $row['pack'] ?: '(none)';
    echo "  - $pack: {$row['count']} workflows\n";
}

echo "\nRun 'pm2 start automation_worker.php --name automation-worker' to process automations.\n";
