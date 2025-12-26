/**
 * FanzDash Automation Engine - Main Entry Point
 * Version: 1.0.0
 *
 * Export all automation functionality.
 */

// Core exports
export {
  dispatchEvent,
  evaluateCondition,
  getNestedValue,
  replaceVars,
  fetchRun,
  fetchWorkflow,
  markRunComplete,
  markRunFailed,
  deleteQueueJob,
  appendResult,
  queueNextAction,
  handleActionFailure,
  logAutomationEvent
} from './core';

// Action exports
export {
  executeAction,
  registerCustomFunction
} from './actions';

// Worker export
export { startWorker } from './worker';

// Type exports
export type {
  AutomationWorkflow,
  AutomationRun,
  AutomationQueueJob,
  AutomationLog,
  AutomationAction,
  ActionResult,
  TriggerCondition,
  ConditionRule,
  EventPayload,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  TestDispatchInput,
  AutomationStats,
  // Action types
  SendEmailAction,
  SendWebhookAction,
  DelayAction,
  DbWriteAction,
  DbUpdateAction,
  AdminNotifyAction,
  CreatorNotifyAction,
  SendDmAction,
  TagUserAction,
  TagCreatorAction,
  AssignTicketAction,
  TriggerPayoutAction,
  CustomCodeAction,
  // Payload types
  UserCreatedPayload,
  CreatorVerifiedPayload,
  SubscriptionStartedPayload,
  SubscriptionCancelledPayload,
  CustomRequestCreatedPayload,
  OrderPlacedPayload,
  PayoutRequestedPayload,
  ContentFlaggedPayload
} from './types';

// ============================================
// Convenience functions for common events
// ============================================

import { dispatchEvent } from './core';
import type {
  UserCreatedPayload,
  CreatorVerifiedPayload,
  SubscriptionStartedPayload,
  SubscriptionCancelledPayload,
  CustomRequestCreatedPayload,
  OrderPlacedPayload,
  PayoutRequestedPayload,
  ContentFlaggedPayload
} from './types';

/**
 * Fire user.created event.
 */
export function onUserCreated(payload: UserCreatedPayload): Promise<number> {
  return dispatchEvent('user.created', payload);
}

/**
 * Fire creator.verified event.
 */
export function onCreatorVerified(payload: CreatorVerifiedPayload): Promise<number> {
  return dispatchEvent('creator.verified', payload);
}

/**
 * Fire subscription.started event.
 */
export function onSubscriptionStarted(payload: SubscriptionStartedPayload): Promise<number> {
  return dispatchEvent('subscription.started', payload);
}

/**
 * Fire subscription.cancelled event.
 */
export function onSubscriptionCancelled(payload: SubscriptionCancelledPayload): Promise<number> {
  return dispatchEvent('subscription.cancelled', payload);
}

/**
 * Fire custom_request.created event.
 */
export function onCustomRequestCreated(payload: CustomRequestCreatedPayload): Promise<number> {
  return dispatchEvent('custom_request.created', payload);
}

/**
 * Fire order.placed event.
 */
export function onOrderPlaced(payload: OrderPlacedPayload): Promise<number> {
  return dispatchEvent('order.placed', payload);
}

/**
 * Fire payout.requested event.
 */
export function onPayoutRequested(payload: PayoutRequestedPayload): Promise<number> {
  return dispatchEvent('payout.requested', payload);
}

/**
 * Fire content.flagged event.
 */
export function onContentFlagged(payload: ContentFlaggedPayload): Promise<number> {
  return dispatchEvent('content.flagged', payload);
}
