# FanzDash Automation Engine v1

Event-driven automation system for the FANZ ecosystem. Think Pabbly Connect, but built for adult content platforms.

## Quick Start

### 1. Run Database Migration

```bash
mysql -u root -p fanz < ../../db/migrations/2025_automation_engine.sql
```

### 2. Seed Preset Workflows

```bash
php seed_workflows.php
```

### 3. Start the Worker

```bash
# PHP worker
pm2 start automation_worker.php --name automation-worker

# Or using ecosystem config
pm2 start ecosystem.config.js --only automation-worker
```

### 4. Wire Events in Your Code

```php
require_once __DIR__ . '/api/automation/core.php';

// After user signup
dispatch_event('user.created', [
    'user_id' => $user->id,
    'user_email' => $user->email,
    'user_name' => $user->username
]);
```

### 5. Access Admin UI

Navigate to `/admin/automations` in FanzDash.

---

## Files

| File | Purpose |
|------|---------|
| `db.php` | Database connection helper |
| `core.php` | Event dispatcher, condition evaluator, helpers |
| `actions.php` | Action handlers (email, webhook, delay, etc.) |
| `automation_worker.php` | Worker daemon for processing queue |
| `index.php` | REST API endpoints |
| `seed_workflows.php` | Seed preset automation packs |
| `cleanup_logs.php` | Clean up old logs (run via cron) |
| `test_events.sh` | Test script for firing sample events |
| `ecosystem.config.js` | PM2 configuration |

---

## Automation Packs

Pre-built workflow bundles:

| Pack | Workflows |
|------|-----------|
| **Onboarding** | User Welcome, Creator Verified |
| **Retention** | High-Value Sub Welcome, Churn Save, Payment Failed Winback |
| **Moderation** | Content Flagged Alert |
| **POD Store** | Auto-Send Order to Provider |
| **Creator Ops** | Custom Request Notification, Payout Notification |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `?action=list-workflows` | GET | List all workflows |
| `?action=get-workflow&id=X` | GET | Get workflow by ID |
| `?action=save-workflow` | POST | Create/update workflow |
| `?action=delete-workflow` | POST | Delete workflow |
| `?action=toggle-workflow` | POST | Enable/disable workflow |
| `?action=list-runs` | GET | List recent runs |
| `?action=get-run&id=X` | GET | Get run details |
| `?action=test-dispatch` | POST | Fire test event |
| `?action=stats` | GET | Get automation stats |

---

## Supported Events

- `user.created`
- `user.login`
- `creator.verified`
- `creator.new_follower`
- `subscription.started`
- `subscription.renewed`
- `subscription.cancelled`
- `subscription.failed`
- `custom_request.created`
- `content.uploaded`
- `content.flagged`
- `order.placed`
- `order.shipped`
- `payout.requested`

---

## Supported Actions

| Action | Description |
|--------|-------------|
| `send_email` | Send templated email |
| `send_webhook` | POST/GET to external URL |
| `delay` | Wait X seconds before next action |
| `admin_notify` | Push notification to admin dashboard |
| `creator_notify` | Push notification to creator |
| `db_write` | Insert row into database |
| `db_update` | Update database row |
| `tag_user` | Add tag to user |
| `tag_creator` | Add tag to creator |
| `custom_code` | Execute predefined function |

---

## Condition Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `{"country": {"eq": "US"}}` |
| `neq` | Not equals | `{"reason": {"neq": "payment_failed"}}` |
| `gt` | Greater than | `{"price": {"gt": 29}}` |
| `gte` | Greater or equal | `{"severity": {"gte": 2}}` |
| `lt` | Less than | `{"age": {"lt": 18}}` |
| `lte` | Less or equal | `{"amount": {"lte": 100}}` |
| `contains` | String contains | `{"email": {"contains": "@gmail"}}` |
| `in` | Value in array | `{"tier": {"in": ["premium", "vip"]}}` |

---

## Testing

```bash
# Fire single test event
./test_events.sh subscription.started

# Fire all test events
./test_events.sh all

# With custom API URL
FANZDASH_API_URL=https://dash.fanz.website/api/automation/index.php ./test_events.sh all
```

---

## Monitoring

```bash
# View worker logs
pm2 logs automation-worker

# Check worker status
pm2 show automation-worker

# Restart worker
pm2 restart automation-worker
```

---

## Troubleshooting

**Worker not processing jobs?**
- Check `pm2 logs automation-worker` for errors
- Verify database connection in `db.php`
- Ensure tables exist (run migration)

**Events not triggering workflows?**
- Check workflow `is_active = 1`
- Verify `trigger_event` matches exactly
- Check `trigger_condition` is satisfied by payload

**Actions failing?**
- Check `automation_logs` table for error details
- Verify action configuration (email templates exist, webhook URLs valid)

---

## See Also

- [Full Specification](../../docs/FANZDASH_AUTOMATIONS_V1_SPEC.md)
- [Integration Examples](./INTEGRATION_EXAMPLES.md)
