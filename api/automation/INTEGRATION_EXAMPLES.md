# FanzDash Automation Engine - Integration Examples

This document shows how to wire automation events into your existing codebase.

---

## Quick Start

### 1. Include the automation core

```php
require_once __DIR__ . '/api/automation/core.php';
```

### 2. Fire events when things happen

```php
dispatch_event('user.created', [
    'user_id' => $user->id,
    'user_email' => $user->email,
    'user_name' => $user->username
]);
```

---

## PHP Integration Examples

### User Registration

```php
// After successful user registration
function registerUser($data) {
    // ... your existing registration logic ...

    $userId = $db->lastInsertId();

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('user.created', [
        'user_id' => $userId,
        'user_name' => $data['username'],
        'user_email' => $data['email'],
        'country' => $data['country'] ?? null,
        'platform' => PLATFORM_NAME, // e.g., 'BoyFanz'
        'created_at' => date('c')
    ]);

    return $userId;
}
```

### Creator Verification

```php
// After admin verifies a creator
function verifyCreator($creatorId) {
    // ... your existing verification logic ...

    $creator = getCreatorById($creatorId);

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('creator.verified', [
        'creator_id' => $creator->id,
        'creator_name' => $creator->username,
        'creator_email' => $creator->email,
        'tier' => $creator->tier,
        'platform' => PLATFORM_NAME,
        'verified_at' => date('c')
    ]);
}
```

### Subscription Started

```php
// After payment succeeds and subscription is created
function createSubscription($userId, $creatorId, $planId, $amount) {
    // ... your existing subscription logic ...

    $subscriptionId = $db->lastInsertId();
    $user = getUserById($userId);

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('subscription.started', [
        'subscription_id' => $subscriptionId,
        'user_id' => $userId,
        'user_email' => $user->email,
        'creator_id' => $creatorId,
        'plan_name' => $plan->name,
        'price' => $amount,
        'currency' => 'USD',
        'period' => 'monthly',
        'platform' => PLATFORM_NAME,
        'started_at' => date('c')
    ]);

    return $subscriptionId;
}
```

### Subscription Cancelled

```php
// When subscription is cancelled (user action or payment failure)
function cancelSubscription($subscriptionId, $reason) {
    // ... your existing cancellation logic ...

    $sub = getSubscriptionById($subscriptionId);

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('subscription.cancelled', [
        'subscription_id' => $subscriptionId,
        'user_id' => $sub->user_id,
        'user_email' => $sub->user->email,
        'creator_id' => $sub->creator_id,
        'reason' => $reason, // 'user_cancelled', 'payment_failed', 'expired'
        'platform' => PLATFORM_NAME,
        'cancelled_at' => date('c')
    ]);
}
```

### Custom Request Created

```php
// When a fan submits a custom content request
function createCustomRequest($userId, $creatorId, $data) {
    // ... your existing request creation logic ...

    $requestId = $db->lastInsertId();
    $user = getUserById($userId);
    $creator = getCreatorById($creatorId);

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('custom_request.created', [
        'request_id' => $requestId,
        'user_id' => $userId,
        'user_name' => $user->username,
        'user_email' => $user->email,
        'creator_id' => $creatorId,
        'creator_name' => $creator->username,
        'price' => $data['price'],
        'currency' => 'USD',
        'request_type' => $data['type'], // 'custom_video', 'photo_set', etc.
        'notes' => $data['notes'],
        'platform' => PLATFORM_NAME,
        'created_at' => date('c')
    ]);

    return $requestId;
}
```

### POD Order Placed

```php
// When a merch order is placed
function placeOrder($userId, $cartItems, $shippingInfo) {
    // ... your existing order logic ...

    $orderId = $db->lastInsertId();
    $user = getUserById($userId);

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('order.placed', [
        'order_id' => $orderId,
        'user_id' => $userId,
        'user_email' => $user->email,
        'total_amount' => calculateTotal($cartItems),
        'currency' => 'USD',
        'items' => array_map(function($item) {
            return [
                'sku' => $item->sku,
                'name' => $item->name,
                'quantity' => $item->quantity,
                'price' => $item->price
            ];
        }, $cartItems),
        'shipping_name' => $shippingInfo['name'],
        'shipping_addr1' => $shippingInfo['address1'],
        'shipping_city' => $shippingInfo['city'],
        'shipping_zip' => $shippingInfo['zip'],
        'shipping_country' => $shippingInfo['country'],
        'platform' => PLATFORM_NAME,
        'created_at' => date('c')
    ]);

    return $orderId;
}
```

### Payout Requested

```php
// When a creator requests a payout
function requestPayout($creatorId, $amount, $method) {
    // ... your existing payout request logic ...

    $payoutId = $db->lastInsertId();
    $creator = getCreatorById($creatorId);

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('payout.requested', [
        'payout_id' => $payoutId,
        'creator_id' => $creatorId,
        'creator_email' => $creator->email,
        'amount' => $amount,
        'currency' => 'USD',
        'method' => $method, // 'bank_transfer', 'paypal', etc.
        'platform' => PLATFORM_NAME,
        'requested_at' => date('c')
    ]);

    return $payoutId;
}
```

### Content Flagged

```php
// When content is flagged (by AI, user report, or admin)
function flagContent($contentId, $flaggedBy, $severity, $reason) {
    // ... your existing flagging logic ...

    $content = getContentById($contentId);

    // Fire automation event
    require_once __DIR__ . '/api/automation/core.php';
    dispatch_event('content.flagged', [
        'content_id' => $contentId,
        'creator_id' => $content->creator_id,
        'flagged_by' => $flaggedBy, // 'ai', 'user', 'admin'
        'severity' => $severity, // 1-3
        'reason' => $reason,
        'platform' => PLATFORM_NAME,
        'flagged_at' => date('c')
    ]);
}
```

---

## TypeScript/Node.js Integration

### Setup

```typescript
import { initAutomation, dispatchEvent } from './automation';

// Initialize at app startup
initAutomation({
  apiUrl: process.env.AUTOMATION_API_URL || 'http://localhost:3000/api/automation',
  platform: process.env.PLATFORM_NAME || 'BoyFanz',
  debug: process.env.NODE_ENV !== 'production',
});
```

### Example: Subscription Started

```typescript
import { onSubscriptionStarted } from './automation';

async function handleSubscriptionCreated(subscription: Subscription, user: User) {
  // ... your existing logic ...

  // Fire automation event
  await onSubscriptionStarted({
    subscription_id: subscription.id,
    user_id: user.id,
    user_email: user.email,
    creator_id: subscription.creatorId,
    price: subscription.price,
    currency: 'USD',
    started_at: new Date().toISOString(),
  });
}
```

---

## Express.js Middleware Example

```typescript
import { dispatchEvent } from './automation';

// Middleware to fire events after successful responses
export function automationMiddleware(eventType: string, payloadExtractor: (req: Request, res: Response) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Fire event after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const payload = payloadExtractor(req, { ...res, body });
        if (payload) {
          dispatchEvent(eventType, payload).catch(console.error);
        }
      }
      return originalJson(body);
    };

    next();
  };
}

// Usage
app.post('/api/subscriptions',
  automationMiddleware('subscription.started', (req, res) => ({
    user_id: req.user.id,
    user_email: req.user.email,
    creator_id: req.body.creatorId,
    price: req.body.price,
    started_at: new Date().toISOString(),
  })),
  subscriptionController.create
);
```

---

## Best Practices

1. **Fire events AFTER the operation succeeds** - Don't dispatch until DB commits are done
2. **Include all relevant data** - Automations may need user_email, creator_name, etc.
3. **Use consistent field names** - Follow the payload schemas in the spec
4. **Include timestamps** - Always add `created_at`, `started_at`, etc.
5. **Add platform identifier** - Helps filter workflows by brand
6. **Handle errors gracefully** - Event dispatch failures shouldn't break your app

```php
// Good: Fire after success, catch errors
try {
    $userId = createUser($data);

    // Don't let automation errors break user registration
    try {
        dispatch_event('user.created', [...]);
    } catch (Exception $e) {
        error_log("Automation dispatch failed: " . $e->getMessage());
    }

    return $userId;
} catch (Exception $e) {
    // Handle registration error
}
```

---

## Testing

Use the test script to fire sample events:

```bash
# Fire a single event
./test_events.sh subscription.started

# Fire all events
./test_events.sh all

# With custom API URL
FANZDASH_API_URL=https://dash.fanz.website/api/automation/index.php ./test_events.sh all
```

Then check the FanzDash Automations admin page to see runs appear.
