#!/bin/bash
#
# FanzDash Automation Engine - Test Events Script
# Version: 1.0.0
#
# Test your automation workflows by firing sample events.
# Usage: ./test_events.sh [event_type]
#
# Available events:
#   user.created
#   creator.verified
#   subscription.started
#   subscription.cancelled
#   custom_request.created
#   order.placed
#   payout.requested
#   content.flagged

API_URL="${FANZDASH_API_URL:-http://localhost:3000/api/automation/index.php}"

echo "FanzDash Automation Test Events"
echo "================================"
echo "API URL: $API_URL"
echo ""

# Function to fire test event
fire_event() {
  local event=$1
  local payload=$2

  echo "Firing: $event"
  echo "Payload: $payload"

  response=$(curl -s -X POST "${API_URL}?action=test-dispatch" \
    -H "Content-Type: application/json" \
    -d "{\"event\": \"$event\", \"payload\": $payload}")

  echo "Response: $response"
  echo ""
}

# Determine which event to fire
EVENT_TYPE="${1:-all}"

case $EVENT_TYPE in
  user.created|user)
    fire_event "user.created" '{
      "user_id": 12345,
      "user_name": "test_fan",
      "user_email": "testfan@example.com",
      "country": "US",
      "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  creator.verified|creator)
    fire_event "creator.verified" '{
      "creator_id": 67890,
      "creator_name": "sexy_creator",
      "creator_email": "creator@example.com",
      "tier": "premium",
      "verified_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  subscription.started|sub)
    fire_event "subscription.started" '{
      "subscription_id": 11111,
      "user_id": 12345,
      "user_email": "testfan@example.com",
      "creator_id": 67890,
      "plan_name": "VIP",
      "price": 39.99,
      "currency": "USD",
      "period": "monthly",
      "started_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  subscription.cancelled|cancelled)
    fire_event "subscription.cancelled" '{
      "subscription_id": 11111,
      "user_id": 12345,
      "user_email": "testfan@example.com",
      "creator_id": 67890,
      "reason": "user_cancelled",
      "cancelled_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  custom_request.created|request)
    fire_event "custom_request.created" '{
      "request_id": 55555,
      "user_id": 12345,
      "user_name": "test_fan",
      "user_email": "testfan@example.com",
      "creator_id": 67890,
      "creator_name": "sexy_creator",
      "price": 75.00,
      "currency": "USD",
      "request_type": "custom_video",
      "notes": "I want a 3 minute video...",
      "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  order.placed|order)
    fire_event "order.placed" '{
      "order_id": 99999,
      "user_id": 12345,
      "user_email": "testfan@example.com",
      "total_amount": 49.99,
      "currency": "USD",
      "items": [
        {
          "sku": "HOODIE_BLACK_L",
          "name": "Black Hoodie - Large",
          "quantity": 1,
          "price": 49.99
        }
      ],
      "shipping_name": "Test User",
      "shipping_addr1": "123 Main St",
      "shipping_city": "Atlanta",
      "shipping_zip": "30301",
      "shipping_country": "US",
      "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  payout.requested|payout)
    fire_event "payout.requested" '{
      "payout_id": 33333,
      "creator_id": 67890,
      "creator_email": "creator@example.com",
      "amount": 420.69,
      "currency": "USD",
      "method": "bank_transfer",
      "requested_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  content.flagged|flagged)
    fire_event "content.flagged" '{
      "content_id": 22222,
      "creator_id": 67890,
      "flagged_by": "ai",
      "severity": 2,
      "reason": "possible TOS violation - review required",
      "flagged_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }'
    ;;

  all)
    echo "Firing all test events..."
    echo ""

    $0 user.created
    sleep 1
    $0 creator.verified
    sleep 1
    $0 subscription.started
    sleep 1
    $0 custom_request.created
    sleep 1
    $0 order.placed
    sleep 1
    $0 payout.requested
    sleep 1
    $0 content.flagged

    echo "All events fired! Check the admin UI for runs."
    ;;

  *)
    echo "Unknown event type: $EVENT_TYPE"
    echo ""
    echo "Usage: $0 [event_type]"
    echo ""
    echo "Available event types:"
    echo "  user.created (or 'user')"
    echo "  creator.verified (or 'creator')"
    echo "  subscription.started (or 'sub')"
    echo "  subscription.cancelled (or 'cancelled')"
    echo "  custom_request.created (or 'request')"
    echo "  order.placed (or 'order')"
    echo "  payout.requested (or 'payout')"
    echo "  content.flagged (or 'flagged')"
    echo "  all - fire all test events"
    exit 1
    ;;
esac

echo "Done!"
