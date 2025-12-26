/**
 * FanzDash Automation Engine - Express Routes
 * Version: 1.0.0 - PostgreSQL
 */

import { Router, Request, Response } from 'express';
import { query } from '../db';
import { dispatchEvent } from './core';
import type {
  AutomationWorkflow,
  AutomationRun,
  CreateWorkflowInput,
  AutomationStats
} from './types';

export const automationRoutes = Router();

// ============================================
// Workflow Routes
// ============================================

automationRoutes.get('/workflows', async (req: Request, res: Response) => {
  try {
    const { pack, platform, is_active } = req.query;

    let sql = 'SELECT * FROM automation_workflows WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (pack) {
      sql += ` AND pack = $${paramIndex++}`;
      params.push(pack);
    }
    if (platform) {
      sql += ` AND platform = $${paramIndex++}`;
      params.push(platform);
    }
    if (is_active !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true' || is_active === '1');
    }

    sql += ' ORDER BY id DESC';

    const workflows = await query<AutomationWorkflow>(sql, params);

    res.json({ success: true, workflows, count: workflows.length });
  } catch (error) {
    console.error('[automation] List workflows error:', error);
    res.status(500).json({ error: 'Failed to list workflows' });
  }
});

automationRoutes.get('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rows = await query<AutomationWorkflow>(
      'SELECT * FROM automation_workflows WHERE id = $1',
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ success: true, workflow: rows[0] });
  } catch (error) {
    console.error('[automation] Get workflow error:', error);
    res.status(500).json({ error: 'Failed to get workflow' });
  }
});

automationRoutes.post('/workflows', async (req: Request, res: Response) => {
  try {
    const data: CreateWorkflowInput & { id?: number } = req.body;

    if (!data.name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!data.trigger_event?.trim()) {
      return res.status(400).json({ error: 'Trigger event is required' });
    }
    if (!data.actions || !Array.isArray(data.actions) || data.actions.length === 0) {
      return res.status(400).json({ error: 'At least one action is required' });
    }

    const userId = (req as any).user?.id || 1;

    if (data.id) {
      await query(`
        UPDATE automation_workflows
        SET name = $1, description = $2, pack = $3, platform = $4,
            trigger_event = $5, trigger_condition = $6, actions = $7, updated_at = NOW()
        WHERE id = $8
      `, [
        data.name,
        data.description || null,
        data.pack || null,
        data.platform || 'global',
        data.trigger_event,
        data.trigger_condition ? JSON.stringify(data.trigger_condition) : null,
        JSON.stringify(data.actions),
        data.id
      ]);

      res.json({ success: true, id: data.id, message: 'Workflow updated' });
    } else {
      const result = await query<{ id: number }>(`
        INSERT INTO automation_workflows
        (name, description, pack, platform, trigger_event, trigger_condition, actions, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        data.name,
        data.description || null,
        data.pack || null,
        data.platform || 'global',
        data.trigger_event,
        data.trigger_condition ? JSON.stringify(data.trigger_condition) : null,
        JSON.stringify(data.actions),
        userId
      ]);

      res.json({ success: true, id: result[0]?.id, message: 'Workflow created' });
    }
  } catch (error) {
    console.error('[automation] Save workflow error:', error);
    res.status(500).json({ error: 'Failed to save workflow' });
  }
});

automationRoutes.delete('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM automation_workflows WHERE id = $1', [id]);
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    console.error('[automation] Delete workflow error:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

automationRoutes.post('/workflows/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active !== undefined) {
      await query(
        'UPDATE automation_workflows SET is_active = $1 WHERE id = $2',
        [is_active, id]
      );
    } else {
      await query(
        'UPDATE automation_workflows SET is_active = NOT is_active WHERE id = $1',
        [id]
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error('[automation] Toggle workflow error:', error);
    res.status(500).json({ error: 'Failed to toggle workflow' });
  }
});

// ============================================
// Run Routes
// ============================================

automationRoutes.get('/runs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const { workflow_id, status } = req.query;

    let sql = `
      SELECT ar.*, aw.name AS workflow_name, aw.trigger_event
      FROM automation_runs ar
      JOIN automation_workflows aw ON aw.id = ar.workflow_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (workflow_id) {
      sql += ` AND ar.workflow_id = $${paramIndex++}`;
      params.push(workflow_id);
    }
    if (status) {
      sql += ` AND ar.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY ar.id DESC LIMIT $${paramIndex++}`;
    params.push(limit);

    const runs = await query<AutomationRun>(sql, params);
    res.json({ success: true, runs, count: runs.length });
  } catch (error) {
    console.error('[automation] List runs error:', error);
    res.status(500).json({ error: 'Failed to list runs' });
  }
});

automationRoutes.get('/runs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rows = await query<any>(`
      SELECT ar.*, aw.name AS workflow_name, aw.trigger_event, aw.actions AS workflow_actions
      FROM automation_runs ar
      JOIN automation_workflows aw ON aw.id = ar.workflow_id
      WHERE ar.id = $1
    `, [id]);

    if (!rows[0]) {
      return res.status(404).json({ error: 'Run not found' });
    }

    const queueItems = await query(
      'SELECT * FROM automation_queue WHERE workflow_run_id = $1 ORDER BY action_step_index',
      [id]
    );

    res.json({ success: true, run: { ...rows[0], queue_items: queueItems } });
  } catch (error) {
    console.error('[automation] Get run error:', error);
    res.status(500).json({ error: 'Failed to get run' });
  }
});

// ============================================
// Dispatch Route
// ============================================

automationRoutes.post('/dispatch', async (req: Request, res: Response) => {
  try {
    const { event, payload } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event name is required' });
    }
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Payload must be an object' });
    }

    const enrichedPayload = {
      ...payload,
      _test: true,
      _test_at: new Date().toISOString()
    };

    const triggered = await dispatchEvent(event, enrichedPayload);

    res.json({
      success: true,
      event,
      payload: enrichedPayload,
      workflows_triggered: triggered,
      message: triggered > 0
        ? `${triggered} workflow(s) triggered. Check Recent Runs.`
        : 'No matching active workflows found for this event.'
    });
  } catch (error) {
    console.error('[automation] Dispatch error:', error);
    res.status(500).json({ error: 'Failed to dispatch event' });
  }
});

// ============================================
// Stats Route
// ============================================

automationRoutes.get('/stats', async (req: Request, res: Response) => {
  try {
    const workflowStats = await query<{ total: string; active: string }>(`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active
      FROM automation_workflows
    `);

    const runStats = await query<{ status: string; count: string }>(`
      SELECT status, COUNT(*) as count
      FROM automation_runs
      WHERE run_at >= NOW() - INTERVAL '24 HOURS'
      GROUP BY status
    `);

    const runs24h: Record<string, number> = {};
    runStats.forEach(row => {
      runs24h[row.status] = parseInt(row.count);
    });

    const queueStats = await query<{ status: string; count: string }>(`
      SELECT status, COUNT(*) as count FROM automation_queue GROUP BY status
    `);

    const queueMap: Record<string, number> = {};
    queueStats.forEach(row => {
      queueMap[row.status] = parseInt(row.count);
    });

    const topTriggers = await query<{ trigger_event: string; count: string }>(`
      SELECT aw.trigger_event, COUNT(*) as count
      FROM automation_runs ar
      JOIN automation_workflows aw ON aw.id = ar.workflow_id
      WHERE ar.run_at >= NOW() - INTERVAL '7 DAYS'
      GROUP BY aw.trigger_event
      ORDER BY count DESC
      LIMIT 10
    `);

    const stats: AutomationStats = {
      workflows: {
        total: parseInt(workflowStats[0]?.total || '0'),
        active: parseInt(workflowStats[0]?.active || '0')
      },
      runs_24h: runs24h,
      queue: queueMap,
      top_triggers_7d: topTriggers.map(t => ({
        trigger_event: t.trigger_event,
        count: parseInt(t.count)
      }))
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('[automation] Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ============================================
// Logs Route
// ============================================

automationRoutes.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 100));
    const { workflow_id, run_id, action_type } = req.query;

    let sql = 'SELECT * FROM automation_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (workflow_id) {
      sql += ` AND workflow_id = $${paramIndex++}`;
      params.push(workflow_id);
    }
    if (run_id) {
      sql += ` AND run_id = $${paramIndex++}`;
      params.push(run_id);
    }
    if (action_type) {
      sql += ` AND action_type = $${paramIndex++}`;
      params.push(action_type);
    }

    sql += ` ORDER BY id DESC LIMIT $${paramIndex++}`;
    params.push(limit);

    const logs = await query<any>(sql, params);
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error('[automation] List logs error:', error);
    res.status(500).json({ error: 'Failed to list logs' });
  }
});
