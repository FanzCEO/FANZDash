/**
 * FanzDash Automation Engine - Type Definitions
 * Version: 1.0.0
 */

// ============================================
// Core Types
// ============================================

export interface AutomationWorkflow {
  id: number;
  name: string;
  description: string | null;
  pack: string | null;
  platform: string;
  trigger_event: string;
  trigger_condition: TriggerCondition | null;
  actions: AutomationAction[];
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface AutomationRun {
  id: number;
  workflow_id: number;
  trigger_data: Record<string, any>;
  status: RunStatus;
  result_data: ActionResult[] | null;
  error_message: string | null;
  run_at: Date;
  completed_at: Date | null;
}

export interface AutomationQueueJob {
  id: number;
  workflow_run_id: number;
  action_step_index: number;
  status: QueueStatus;
  retry_count: number;
  max_retries: number;
  next_attempt_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
  error_message: string | null;
  created_at: Date;
}

export interface AutomationLog {
  id: number;
  workflow_id: number | null;
  run_id: number | null;
  action_type: string;
  action_data: Record<string, any> | null;
  result_status: string;
  result_data: Record<string, any> | null;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: Date;
}

// ============================================
// Status Types
// ============================================

export type RunStatus = 'pending' | 'running' | 'success' | 'failed';
export type QueueStatus = 'queued' | 'running' | 'success' | 'failed';

// ============================================
// Trigger Conditions
// ============================================

export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'exists';

export interface ConditionRule {
  eq?: string | number | boolean;
  neq?: string | number | boolean;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  contains?: string;
  in?: (string | number)[];
  exists?: boolean;
}

export type TriggerCondition = Record<string, ConditionRule>;

// ============================================
// Actions
// ============================================

export type ActionType =
  | 'send_email'
  | 'send_webhook'
  | 'delay'
  | 'db_write'
  | 'db_update'
  | 'admin_notify'
  | 'creator_notify'
  | 'send_dm'
  | 'tag_user'
  | 'tag_creator'
  | 'assign_ticket'
  | 'trigger_payout'
  | 'custom_code';

export interface BaseAction {
  type: ActionType;
}

export interface SendEmailAction extends BaseAction {
  type: 'send_email';
  to: string;
  template: string;
  subject?: string;
  data?: Record<string, any>;
}

export interface SendWebhookAction extends BaseAction {
  type: 'send_webhook';
  url: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

export interface DelayAction extends BaseAction {
  type: 'delay';
  seconds: number;
}

export interface DbWriteAction extends BaseAction {
  type: 'db_write';
  table: string;
  data: Record<string, any>;
}

export interface DbUpdateAction extends BaseAction {
  type: 'db_update';
  table: string;
  set: Record<string, any>;
  where: Record<string, any>;
}

export interface AdminNotifyAction extends BaseAction {
  type: 'admin_notify';
  message: string;
  level?: 'info' | 'warning' | 'error';
}

export interface CreatorNotifyAction extends BaseAction {
  type: 'creator_notify';
  message: string;
}

export interface SendDmAction extends BaseAction {
  type: 'send_dm';
  to_user_id: string;
  from_type?: 'system' | 'creator' | 'admin';
  message: string;
}

export interface TagUserAction extends BaseAction {
  type: 'tag_user';
  tag: string;
}

export interface TagCreatorAction extends BaseAction {
  type: 'tag_creator';
  tag: string;
}

export interface AssignTicketAction extends BaseAction {
  type: 'assign_ticket';
  assign_to: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface TriggerPayoutAction extends BaseAction {
  type: 'trigger_payout';
  auto_approve?: boolean;
}

export interface CustomCodeAction extends BaseAction {
  type: 'custom_code';
  function: string;
}

export type AutomationAction =
  | SendEmailAction
  | SendWebhookAction
  | DelayAction
  | DbWriteAction
  | DbUpdateAction
  | AdminNotifyAction
  | CreatorNotifyAction
  | SendDmAction
  | TagUserAction
  | TagCreatorAction
  | AssignTicketAction
  | TriggerPayoutAction
  | CustomCodeAction;

// ============================================
// Action Results
// ============================================

export interface ActionResult {
  type: ActionType;
  status: string;
  _executed_at?: string;
  [key: string]: any;
}

// ============================================
// Event Payloads
// ============================================

export interface UserCreatedPayload {
  user_id: number;
  user_name: string;
  user_email: string;
  country?: string;
  created_at: string;
}

export interface CreatorVerifiedPayload {
  creator_id: number;
  creator_name: string;
  creator_email: string;
  tier?: string;
  verified_at: string;
}

export interface SubscriptionStartedPayload {
  subscription_id: number;
  user_id: number;
  user_email: string;
  creator_id: number;
  plan_name?: string;
  price: number;
  currency: string;
  period?: string;
  started_at: string;
}

export interface SubscriptionCancelledPayload {
  subscription_id: number;
  user_id: number;
  user_email?: string;
  creator_id: number;
  reason?: string;
  cancelled_at: string;
}

export interface CustomRequestCreatedPayload {
  request_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  creator_id: number;
  creator_name: string;
  price: number;
  currency: string;
  request_type: string;
  notes?: string;
  created_at: string;
}

export interface OrderPlacedPayload {
  order_id: number;
  user_id: number;
  user_email: string;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  shipping_name: string;
  shipping_addr1: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  created_at: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PayoutRequestedPayload {
  payout_id: number;
  creator_id: number;
  creator_email: string;
  amount: number;
  currency: string;
  method?: string;
  requested_at: string;
}

export interface ContentFlaggedPayload {
  content_id: number;
  creator_id: number;
  flagged_by: 'ai' | 'user' | 'admin';
  severity: number;
  reason: string;
  flagged_at: string;
}

export type EventPayload =
  | UserCreatedPayload
  | CreatorVerifiedPayload
  | SubscriptionStartedPayload
  | SubscriptionCancelledPayload
  | CustomRequestCreatedPayload
  | OrderPlacedPayload
  | PayoutRequestedPayload
  | ContentFlaggedPayload
  | Record<string, any>;

// ============================================
// API Types
// ============================================

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  pack?: string;
  platform?: string;
  trigger_event: string;
  trigger_condition?: TriggerCondition;
  actions: AutomationAction[];
}

export interface UpdateWorkflowInput extends Partial<CreateWorkflowInput> {
  id: number;
}

export interface TestDispatchInput {
  event: string;
  payload: Record<string, any>;
}

export interface AutomationStats {
  workflows: {
    total: number;
    active: number;
  };
  runs_24h: Record<RunStatus, number>;
  queue: Record<QueueStatus, number>;
  top_triggers_7d: Array<{
    trigger_event: string;
    count: number;
  }>;
}
