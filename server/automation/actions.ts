/**
 * FanzDash Automation Engine - Action Handlers (TypeScript)
 * Version: 1.0.0
 *
 * All automation action handlers.
 */

import { db } from '../db';
import { replaceVars } from './core';
import type {
  AutomationAction,
  ActionResult,
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
  CustomCodeAction
} from './types';

// ============================================
// Main Action Router
// ============================================

/**
 * Execute an automation action.
 */
export async function executeAction(
  action: AutomationAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  switch (action.type) {
    case 'send_email':
      return sendEmailAction(action, payload);

    case 'send_webhook':
      return sendWebhookAction(action, payload);

    case 'delay':
      return delayAction(action);

    case 'db_write':
      return dbWriteAction(action, payload);

    case 'db_update':
      return dbUpdateAction(action, payload);

    case 'admin_notify':
      return adminNotifyAction(action, payload);

    case 'creator_notify':
      return creatorNotifyAction(action, payload);

    case 'send_dm':
      return sendDmAction(action, payload);

    case 'tag_user':
      return tagUserAction(action, payload);

    case 'tag_creator':
      return tagCreatorAction(action, payload);

    case 'assign_ticket':
      return assignTicketAction(action, payload);

    case 'trigger_payout':
      return triggerPayoutAction(action, payload);

    case 'custom_code':
      return customCodeAction(action, payload);

    default:
      throw new Error(`Unknown action type: ${(action as any).type}`);
  }
}

// ============================================
// Email Actions
// ============================================

async function sendEmailAction(
  action: SendEmailAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const to = replaceVars(action.to, payload);
  const template = action.template;
  const subject = action.subject ? replaceVars(action.subject, payload) : undefined;
  const extraData = action.data || {};

  if (!to || !isValidEmail(to)) {
    throw new Error(`Invalid email address: ${to}`);
  }

  // Template data
  const templateData = { ...payload, ...extraData };

  // TODO: Integrate with your email service
  // Examples:
  // - await sendgrid.send({ to, template, data: templateData });
  // - await emailService.sendTemplate(to, template, templateData);

  console.log(`[FanzDash Automation] Send email to: ${to}, template: ${template}`);

  return {
    type: 'send_email',
    to,
    template,
    subject,
    status: 'queued'
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// Webhook Actions
// ============================================

async function sendWebhookAction(
  action: SendWebhookAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const url = action.url;
  const method = action.method || 'POST';
  const headers = action.headers || {};
  const body = action.body || {};

  if (!url) {
    throw new Error('Webhook URL is required');
  }

  // Replace variables in body
  const bodyJson = replaceVars(JSON.stringify(body), payload);

  // Prepare headers
  const allHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'FanzDash-Automation/1.0',
    ...Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k, replaceVars(v, payload)])
    )
  };

  // Make the request
  const response = await fetch(url, {
    method,
    headers: allHeaders,
    body: method !== 'GET' ? bodyJson : undefined,
    signal: AbortSignal.timeout(30000) // 30s timeout
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Webhook returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  const responseText = await response.text().catch(() => '');

  return {
    type: 'send_webhook',
    url,
    method,
    http_code: response.status,
    response: responseText.slice(0, 1000),
    status: 'sent'
  };
}

// ============================================
// Delay Action
// ============================================

function delayAction(action: DelayAction): ActionResult {
  const seconds = action.seconds || 0;

  return {
    type: 'delay',
    seconds,
    human_readable: formatDuration(seconds),
    status: 'scheduled'
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  return `${(seconds / 86400).toFixed(1)} days`;
}

// ============================================
// Database Actions
// ============================================

async function dbWriteAction(
  action: DbWriteAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const table = action.table;
  const data = action.data;

  if (!table || !data || typeof data !== 'object') {
    throw new Error('db_write requires table and data');
  }

  // Sanitize table name
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error('Invalid table name');
  }

  // Replace vars in values
  const cols = Object.keys(data);
  const vals = Object.values(data).map(v =>
    typeof v === 'string' ? replaceVars(v, payload) : v
  );

  const placeholders = cols.map(() => '?').join(',');
  const colList = cols.map(c => `\`${c}\``).join(',');

  const result = await db.query<{ insertId: number }>(
    `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders})`,
    vals
  );

  return {
    type: 'db_write',
    table,
    insert_id: result.insertId,
    status: 'inserted'
  };
}

async function dbUpdateAction(
  action: DbUpdateAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const table = action.table;
  const setData = action.set;
  const whereData = action.where;

  if (!table || !setData || !whereData) {
    throw new Error('db_update requires table, set, and where');
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error('Invalid table name');
  }

  // Build SET clause
  const setParts: string[] = [];
  const setVals: any[] = [];
  for (const [col, val] of Object.entries(setData)) {
    setParts.push(`\`${col}\` = ?`);
    setVals.push(typeof val === 'string' ? replaceVars(val, payload) : val);
  }

  // Build WHERE clause
  const whereParts: string[] = [];
  const whereVals: any[] = [];
  for (const [col, val] of Object.entries(whereData)) {
    whereParts.push(`\`${col}\` = ?`);
    whereVals.push(typeof val === 'string' ? replaceVars(val, payload) : val);
  }

  const result = await db.query<{ affectedRows: number }>(
    `UPDATE \`${table}\` SET ${setParts.join(', ')} WHERE ${whereParts.join(' AND ')}`,
    [...setVals, ...whereVals]
  );

  return {
    type: 'db_update',
    table,
    rows_affected: result.affectedRows,
    status: 'updated'
  };
}

// ============================================
// Notification Actions
// ============================================

async function adminNotifyAction(
  action: AdminNotifyAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const message = replaceVars(action.message, payload);
  const level = action.level || 'info';

  // TODO: Integrate with your admin notification system
  // - Insert into admin_notifications table
  // - Push to admin dashboard WebSocket
  // - Send Slack/Discord webhook

  try {
    await db.query(
      'INSERT INTO admin_notifications (message, level, created_at) VALUES (?, ?, NOW())',
      [message, level]
    );
  } catch {
    console.log(`[FanzDash Automation] Admin notify: [${level}] ${message}`);
  }

  return {
    type: 'admin_notify',
    message,
    level,
    status: 'notified'
  };
}

async function creatorNotifyAction(
  action: CreatorNotifyAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const creatorId = payload.creator_id;
  const message = replaceVars(action.message, payload);

  if (!creatorId) {
    throw new Error('creator_id missing in payload');
  }

  // TODO: Integrate with your creator notification system
  try {
    await db.query(
      'INSERT INTO creator_notifications (creator_id, message, created_at) VALUES (?, ?, NOW())',
      [creatorId, message]
    );
  } catch {
    console.log(`[FanzDash Automation] Creator notify (${creatorId}): ${message}`);
  }

  return {
    type: 'creator_notify',
    creator_id: creatorId,
    message,
    status: 'notified'
  };
}

async function sendDmAction(
  action: SendDmAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const toUserId = replaceVars(action.to_user_id, payload);
  const fromType = action.from_type || 'system';
  const message = replaceVars(action.message, payload);

  if (!toUserId) {
    throw new Error('to_user_id is required for send_dm');
  }

  // TODO: Integrate with your messaging system
  console.log(`[FanzDash Automation] Send DM to user ${toUserId}: ${message}`);

  return {
    type: 'send_dm',
    to_user_id: toUserId,
    from_type: fromType,
    message: message.slice(0, 100) + '...',
    status: 'sent'
  };
}

// ============================================
// Tagging Actions
// ============================================

async function tagUserAction(
  action: TagUserAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const userId = payload.user_id;
  const tag = action.tag;

  if (!userId || !tag) {
    throw new Error('tag_user requires user_id in payload and tag in action');
  }

  try {
    await db.query(`
      INSERT INTO user_tags (user_id, tag, created_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE created_at = NOW()
    `, [userId, tag]);
  } catch {
    console.log(`[FanzDash Automation] Tag user ${userId} with: ${tag}`);
  }

  return {
    type: 'tag_user',
    user_id: userId,
    tag,
    status: 'tagged'
  };
}

async function tagCreatorAction(
  action: TagCreatorAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const creatorId = payload.creator_id;
  const tag = action.tag;

  if (!creatorId || !tag) {
    throw new Error('tag_creator requires creator_id in payload and tag in action');
  }

  try {
    await db.query(`
      INSERT INTO creator_tags (creator_id, tag, created_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE created_at = NOW()
    `, [creatorId, tag]);
  } catch {
    console.log(`[FanzDash Automation] Tag creator ${creatorId} with: ${tag}`);
  }

  return {
    type: 'tag_creator',
    creator_id: creatorId,
    tag,
    status: 'tagged'
  };
}

// ============================================
// Support Actions
// ============================================

async function assignTicketAction(
  action: AssignTicketAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const ticketId = payload.ticket_id;
  const assignTo = action.assign_to;
  const priority = action.priority || 'normal';

  if (!ticketId) {
    throw new Error('ticket_id missing in payload');
  }

  // TODO: Integrate with your support ticket system
  console.log(`[FanzDash Automation] Assign ticket ${ticketId} to ${assignTo} (priority: ${priority})`);

  return {
    type: 'assign_ticket',
    ticket_id: ticketId,
    assign_to: assignTo,
    priority,
    status: 'assigned'
  };
}

// ============================================
// Payout Actions
// ============================================

async function triggerPayoutAction(
  action: TriggerPayoutAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const creatorId = payload.creator_id;
  const amount = payload.amount;
  const autoApprove = action.auto_approve || false;

  if (!creatorId) {
    throw new Error('creator_id missing in payload');
  }

  // TODO: Integrate with your payout system
  console.log(`[FanzDash Automation] Trigger payout for creator ${creatorId}: ${amount} (auto_approve: ${autoApprove})`);

  return {
    type: 'trigger_payout',
    creator_id: creatorId,
    amount,
    auto_approve: autoApprove,
    status: autoApprove ? 'processing' : 'queued_for_review'
  };
}

// ============================================
// Custom Code Action
// ============================================

// Registry of allowed custom functions
const customFunctions: Record<string, (payload: Record<string, any>) => Promise<ActionResult>> = {
  'calculate_loyalty_bonus': async (payload) => {
    // Example implementation
    return { type: 'custom_code', function: 'calculate_loyalty_bonus', status: 'executed' };
  },
  'update_referral_count': async (payload) => {
    return { type: 'custom_code', function: 'update_referral_count', status: 'executed' };
  },
  'sync_external_crm': async (payload) => {
    return { type: 'custom_code', function: 'sync_external_crm', status: 'executed' };
  }
};

async function customCodeAction(
  action: CustomCodeAction,
  payload: Record<string, any>
): Promise<ActionResult> {
  const functionKey = action.function;

  if (!functionKey) {
    throw new Error('custom_code requires function key');
  }

  const fn = customFunctions[functionKey];
  if (!fn) {
    throw new Error(`Unknown custom function: ${functionKey}`);
  }

  return fn(payload);
}

/**
 * Register a custom function for use in automations.
 */
export function registerCustomFunction(
  name: string,
  fn: (payload: Record<string, any>) => Promise<ActionResult>
): void {
  customFunctions[name] = fn;
}
