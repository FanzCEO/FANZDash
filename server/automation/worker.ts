/**
 * FanzDash Automation Engine - Worker Daemon (TypeScript)
 * Version: 1.0.0
 *
 * Run with: pm2 start dist/automation/worker.js --name automation-worker
 */

import { db } from '../db';
import {
  fetchRun,
  fetchWorkflow,
  markRunComplete,
  appendResult,
  queueNextAction,
  handleActionFailure,
  logAutomationEvent,
  deleteQueueJob
} from './core';
import { executeAction } from './actions';
import type { AutomationQueueJob, AutomationAction } from './types';

// Configuration
const POLL_INTERVAL_MS = 300;
const MAX_EXECUTION_TIME_MS = 30000;
const BATCH_SIZE = 10;

// Stats
const stats = {
  startedAt: new Date().toISOString(),
  jobsProcessed: 0,
  jobsSucceeded: 0,
  jobsFailed: 0
};

let running = true;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[automation-worker] Received SIGTERM, shutting down...');
  printStats();
  running = false;
});

process.on('SIGINT', () => {
  console.log('\n[automation-worker] Received SIGINT, shutting down...');
  printStats();
  running = false;
});

/**
 * Main worker entry point.
 */
export async function startWorker(): Promise<void> {
  console.log('[automation-worker] Starting FanzDash Automation Worker...');
  console.log(`[automation-worker] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`[automation-worker] Max execution time: ${MAX_EXECUTION_TIME_MS}ms`);
  console.log(`[automation-worker] Started at: ${stats.startedAt}\n`);

  while (running) {
    try {
      const jobsThisCycle = await processQueueCycle();

      if (jobsThisCycle === 0) {
        await sleep(POLL_INTERVAL_MS);
      } else {
        stats.jobsProcessed += jobsThisCycle;
        await sleep(50);
      }
    } catch (error) {
      console.error('[automation-worker] ERROR:', error);
      await sleep(5000);
    }
  }

  console.log('[automation-worker] Worker stopped.');
}

/**
 * Process one cycle of the queue.
 */
async function processQueueCycle(): Promise<number> {
  const jobs = await db.query<AutomationQueueJob[]>(`
    SELECT * FROM automation_queue
    WHERE status = 'queued'
      AND next_attempt_at <= NOW()
    ORDER BY id ASC
    LIMIT ${BATCH_SIZE}
  `);

  let processed = 0;

  for (const job of jobs) {
    await processSingleJob(job);
    processed++;
  }

  return processed;
}

/**
 * Process a single job from the queue.
 */
async function processSingleJob(job: AutomationQueueJob): Promise<void> {
  const startTime = Date.now();
  const jobId = job.id;
  const runId = job.workflow_run_id;
  const stepIndex = job.action_step_index;

  console.log(`[automation-worker] Processing job #${jobId} (run: ${runId}, step: ${stepIndex})...`);

  // Mark job as running
  await db.query(
    'UPDATE automation_queue SET status = ?, started_at = NOW() WHERE id = ?',
    ['running', jobId]
  );

  // Fetch run
  const run = await fetchRun(runId);
  if (!run) {
    console.log(`[automation-worker] Run #${runId} not found, deleting job.`);
    await deleteQueueJob(jobId);
    return;
  }

  // Fetch workflow
  const workflow = await fetchWorkflow(run.workflow_id);
  if (!workflow) {
    console.log(`[automation-worker] Workflow for run #${runId} not found, deleting job.`);
    await deleteQueueJob(jobId);
    return;
  }

  // Get actions
  const actions: AutomationAction[] = typeof workflow.actions === 'string'
    ? JSON.parse(workflow.actions)
    : workflow.actions;

  const action = actions[stepIndex];

  if (!action) {
    console.log(`[automation-worker] No action at step ${stepIndex}, marking run complete.`);
    await markRunComplete(runId);
    await deleteQueueJob(jobId);
    return;
  }

  // Get payload
  const payload = typeof run.trigger_data === 'string'
    ? JSON.parse(run.trigger_data)
    : run.trigger_data;

  try {
    // Execute action
    const result = await executeAction(action, payload);
    const executionTime = Date.now() - startTime;

    // Log success
    await logAutomationEvent({
      workflowId: workflow.id,
      runId,
      actionType: action.type,
      actionData: action as Record<string, any>,
      resultStatus: 'success',
      resultData: result as Record<string, any>,
      executionTimeMs: executionTime
    });

    // Append result
    await appendResult(runId, result);

    // Queue next step
    await queueNextAction(job, workflow, run);

    // Mark job complete
    await db.query(
      'UPDATE automation_queue SET status = ?, completed_at = NOW() WHERE id = ?',
      ['success', jobId]
    );
    await deleteQueueJob(jobId);

    stats.jobsSucceeded++;
    console.log(`[automation-worker] Job #${jobId} completed (${action.type}, ${executionTime}ms).`);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log failure
    await logAutomationEvent({
      workflowId: workflow.id,
      runId,
      actionType: action.type,
      actionData: action as Record<string, any>,
      resultStatus: 'failed',
      errorMessage,
      executionTimeMs: executionTime
    });

    // Handle failure (retry or mark as failed)
    await handleActionFailure(job, errorMessage);

    stats.jobsFailed++;
    console.log(`[automation-worker] Job #${jobId} failed: ${errorMessage}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printStats(): void {
  console.log('\n===== Worker Statistics =====');
  console.log(`Started: ${stats.startedAt}`);
  console.log(`Jobs Processed: ${stats.jobsProcessed}`);
  console.log(`Jobs Succeeded: ${stats.jobsSucceeded}`);
  console.log(`Jobs Failed: ${stats.jobsFailed}`);
  if (stats.jobsProcessed > 0) {
    const successRate = ((stats.jobsSucceeded / stats.jobsProcessed) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
  }
  console.log('=============================\n');
}

// Auto-start if run directly
if (require.main === module) {
  startWorker().catch(console.error);
}
