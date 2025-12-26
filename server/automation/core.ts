/**
 * FanzDash Automation Engine - Core Logic (TypeScript)
 * Version: 1.0.0
 *
 * Core automation dispatcher and helper functions.
 */

import { db } from '../db';
import type {
  AutomationWorkflow,
  AutomationRun,
  AutomationQueueJob,
  TriggerCondition,
  ConditionRule,
  EventPayload,
  ActionResult
} from './types';

// ============================================
// Event Dispatcher
// ============================================

/**
 * Dispatch an internal event into the automation engine.
 *
 * @example
 * dispatchEvent('subscription.started', {
 *   user_id: 123,
 *   price: 39.99,
 *   user_email: 'fan@example.com'
 * });
 */
export async function dispatchEvent(
  eventName: string,
  payload: EventPayload
): Promise<number> {
  let triggered = 0;

  // Add metadata
  const enrichedPayload = {
    ...payload,
    _event: eventName,
    _timestamp: new Date().toISOString()
  };

  // Find all active workflows for this event
  const workflows = await db.query<AutomationWorkflow[]>(`
    SELECT * FROM automation_workflows
    WHERE trigger_event = ? AND is_active = 1
  `, [eventName]);

  for (const workflow of workflows) {
    // Parse and evaluate conditions
    const conditions = workflow.trigger_condition
      ? (typeof workflow.trigger_condition === 'string'
        ? JSON.parse(workflow.trigger_condition)
        : workflow.trigger_condition)
      : null;

    if (!evaluateCondition(conditions, enrichedPayload)) {
      continue;
    }

    // Create run record
    const runResult = await db.query<{ insertId: number }>(`
      INSERT INTO automation_runs (workflow_id, trigger_data, status)
      VALUES (?, ?, 'pending')
    `, [workflow.id, JSON.stringify(enrichedPayload)]);

    const runId = runResult.insertId;

    // Queue first action step
    await db.query(`
      INSERT INTO automation_queue (workflow_run_id, action_step_index, status)
      VALUES (?, 0, 'queued')
    `, [runId]);

    // Log the dispatch
    await logAutomationEvent({
      workflowId: workflow.id,
      runId,
      actionType: 'dispatch',
      actionData: { event: eventName, workflow_name: workflow.name },
      resultStatus: 'success'
    });

    triggered++;
  }

  return triggered;
}

// ============================================
// Condition Evaluation
// ============================================

/**
 * Evaluate trigger conditions against payload.
 */
export function evaluateCondition(
  conditions: TriggerCondition | null,
  payload: Record<string, any>
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }

  for (const [field, rules] of Object.entries(conditions)) {
    const value = getNestedValue(payload, field);

    for (const [op, target] of Object.entries(rules as ConditionRule)) {
      switch (op) {
        case 'eq':
          if (value != target) return false;
          break;
        case 'neq':
          if (value == target) return false;
          break;
        case 'gt':
          if (typeof value !== 'number' || value <= (target as number)) return false;
          break;
        case 'gte':
          if (typeof value !== 'number' || value < (target as number)) return false;
          break;
        case 'lt':
          if (typeof value !== 'number' || value >= (target as number)) return false;
          break;
        case 'lte':
          if (typeof value !== 'number' || value > (target as number)) return false;
          break;
        case 'contains':
          if (typeof value !== 'string' || !value.includes(target as string)) return false;
          break;
        case 'in':
          if (!Array.isArray(target) || !target.includes(value)) return false;
          break;
        case 'exists':
          if (target === true && value === undefined) return false;
          if (target === false && value !== undefined) return false;
          break;
      }
    }
  }

  return true;
}

/**
 * Get a nested value from an object using dot notation.
 */
export function getNestedValue(obj: Record<string, any>, path: string): any {
  const keys = path.split('.');
  let value: any = obj;

  for (const key of keys) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

// ============================================
// Database Helpers
// ============================================

export async function fetchRun(runId: number): Promise<AutomationRun | null> {
  const rows = await db.query<AutomationRun[]>(
    'SELECT * FROM automation_runs WHERE id = ?',
    [runId]
  );
  return rows[0] || null;
}

export async function fetchWorkflow(workflowId: number): Promise<AutomationWorkflow | null> {
  const rows = await db.query<AutomationWorkflow[]>(
    'SELECT * FROM automation_workflows WHERE id = ?',
    [workflowId]
  );
  return rows[0] || null;
}

export async function markRunComplete(runId: number): Promise<void> {
  await db.query(`
    UPDATE automation_runs
    SET status = 'success', completed_at = NOW()
    WHERE id = ?
  `, [runId]);
}

export async function markRunFailed(runId: number, errorMessage: string): Promise<void> {
  await db.query(`
    UPDATE automation_runs
    SET status = 'failed', error_message = ?, completed_at = NOW()
    WHERE id = ?
  `, [errorMessage, runId]);
}

export async function deleteQueueJob(jobId: number): Promise<void> {
  await db.query('DELETE FROM automation_queue WHERE id = ?', [jobId]);
}

export async function appendResult(runId: number, result: ActionResult): Promise<void> {
  const rows = await db.query<{ result_data: string | null }[]>(
    'SELECT result_data FROM automation_runs WHERE id = ?',
    [runId]
  );

  const existing: ActionResult[] = rows[0]?.result_data
    ? JSON.parse(rows[0].result_data)
    : [];

  result._executed_at = new Date().toISOString();
  existing.push(result);

  await db.query(
    'UPDATE automation_runs SET result_data = ? WHERE id = ?',
    [JSON.stringify(existing), runId]
  );
}

export async function queueNextAction(
  job: AutomationQueueJob,
  workflow: AutomationWorkflow,
  run: AutomationRun
): Promise<void> {
  const actions = typeof workflow.actions === 'string'
    ? JSON.parse(workflow.actions)
    : workflow.actions;

  const nextIndex = job.action_step_index + 1;

  if (!actions[nextIndex]) {
    await markRunComplete(run.id);
    return;
  }

  const nextAction = actions[nextIndex];
  let delaySeconds = 0;

  if (nextAction.type === 'delay' && nextAction.seconds) {
    delaySeconds = nextAction.seconds;
  }

  await db.query(`
    INSERT INTO automation_queue (workflow_run_id, action_step_index, next_attempt_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))
  `, [run.id, nextIndex, delaySeconds]);
}

export async function handleActionFailure(
  job: AutomationQueueJob,
  errorMessage: string
): Promise<void> {
  const maxRetries = job.max_retries || 3;

  if (job.retry_count >= maxRetries) {
    // Mark job as failed
    await db.query(`
      UPDATE automation_queue
      SET status = 'failed', error_message = ?, completed_at = NOW()
      WHERE id = ?
    `, [errorMessage, job.id]);

    // Mark run as failed
    await markRunFailed(
      job.workflow_run_id,
      `Action step ${job.action_step_index} failed after ${maxRetries} retries: ${errorMessage}`
    );
    return;
  }

  // Exponential backoff
  const retryCount = job.retry_count + 1;
  const backoffSeconds = Math.pow(2, retryCount) * 10;

  await db.query(`
    UPDATE automation_queue
    SET status = 'queued',
        retry_count = ?,
        error_message = ?,
        next_attempt_at = DATE_ADD(NOW(), INTERVAL ? SECOND)
    WHERE id = ?
  `, [retryCount, errorMessage, backoffSeconds, job.id]);

  // Log retry
  await logAutomationEvent({
    runId: job.workflow_run_id,
    actionType: 'retry',
    actionData: {
      step_index: job.action_step_index,
      retry_count: retryCount,
      backoff_seconds: backoffSeconds,
      error: errorMessage
    },
    resultStatus: 'warning'
  });
}

// ============================================
// Logging
// ============================================

interface LogEventParams {
  workflowId?: number;
  runId?: number;
  actionType: string;
  actionData?: Record<string, any>;
  resultStatus: string;
  resultData?: Record<string, any>;
  errorMessage?: string;
  executionTimeMs?: number;
}

export async function logAutomationEvent(params: LogEventParams): Promise<void> {
  try {
    await db.query(`
      INSERT INTO automation_logs
      (workflow_id, run_id, action_type, action_data, result_status, result_data, error_message, execution_time_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      params.workflowId || null,
      params.runId || null,
      params.actionType,
      params.actionData ? JSON.stringify(params.actionData) : null,
      params.resultStatus,
      params.resultData ? JSON.stringify(params.resultData) : null,
      params.errorMessage || null,
      params.executionTimeMs || null
    ]);
  } catch (error) {
    console.error('[FanzDash Automation] Failed to log event:', error);
  }
}

// ============================================
// Variable Replacement
// ============================================

/**
 * Replace {var} placeholders with payload values.
 */
export function replaceVars(str: string, payload: Record<string, any>): string {
  return str.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = getNestedValue(payload, key);

    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  });
}
