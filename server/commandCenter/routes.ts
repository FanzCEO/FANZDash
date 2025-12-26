/**
 * FanzDash Central Command Center - API Routes
 * dash.Fanz.Website/api/command-center/*
 */

import { Router, Request, Response, NextFunction } from 'express';
import { commandCenter, PlatformType } from './platformConnector';
import crypto from 'crypto';

const router = Router();

// Middleware to verify command center API key
const verifyCommandCenterAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-command-center-key'] as string;
  const masterKey = process.env.COMMAND_CENTER_API_KEY;

  if (!apiKey || apiKey !== masterKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid command center API key'
    });
  }

  next();
};

// Middleware to verify platform API key
const verifyPlatformAuth = (req: Request, res: Response, next: NextFunction) => {
  const platformId = req.headers['x-platform-id'] as string;
  const apiKey = req.headers['x-platform-key'] as string;

  if (!platformId || !apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Missing platform credentials'
    });
  }

  if (!commandCenter.authenticatePlatform(platformId, apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid platform credentials'
    });
  }

  (req as any).platformId = platformId;
  next();
};

/**
 * @route GET /api/command-center/status
 * @desc Get command center status and overview
 */
router.get('/status', (req, res) => {
  const metrics = commandCenter.getAggregatedMetrics();

  res.json({
    success: true,
    data: {
      status: 'operational',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      metrics
    }
  });
});

/**
 * @route POST /api/command-center/platforms/register
 * @desc Register a new platform with the command center
 */
router.post('/platforms/register', verifyCommandCenterAuth, async (req, res) => {
  try {
    const { name, type, url, version, capabilities } = req.body;

    if (!name || !type || !url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, url'
      });
    }

    const validTypes: PlatformType[] = [
      'main-website', 'creator-portal', 'admin-panel', 'mobile-app',
      'streaming-service', 'payment-gateway', 'cdn-node', 'analytics-engine',
      'moderation-ai', 'custom'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid platform type. Valid types: ${validTypes.join(', ')}`
      });
    }

    const result = await commandCenter.registerPlatform({
      name,
      type,
      url,
      version: version || '1.0.0',
      capabilities: capabilities || []
    });

    res.status(201).json({
      success: true,
      data: {
        platformId: result.platformId,
        apiKey: result.apiKey,
        websocketUrl: `wss://dash.Fanz.Website/command-center/ws?platformId=${result.platformId}&apiKey=${result.apiKey}`,
        message: 'Platform registered successfully. Save your API key securely.'
      }
    });
  } catch (error) {
    console.error('[CommandCenter] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register platform'
    });
  }
});

/**
 * @route GET /api/command-center/platforms
 * @desc Get all connected platforms
 */
router.get('/platforms', verifyCommandCenterAuth, (req, res) => {
  const platforms = commandCenter.getAllPlatforms();

  res.json({
    success: true,
    data: {
      count: platforms.length,
      platforms
    }
  });
});

/**
 * @route GET /api/command-center/platforms/:platformId
 * @desc Get specific platform details
 */
router.get('/platforms/:platformId', verifyCommandCenterAuth, (req, res) => {
  const platform = commandCenter.getPlatform(req.params.platformId);

  if (!platform) {
    return res.status(404).json({
      success: false,
      error: 'Platform not found'
    });
  }

  res.json({
    success: true,
    data: platform
  });
});

/**
 * @route POST /api/command-center/platforms/:platformId/command
 * @desc Send command to a specific platform
 */
router.post('/platforms/:platformId/command', verifyCommandCenterAuth, (req, res) => {
  const { action, data, priority } = req.body;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: action'
    });
  }

  const sent = commandCenter.sendCommand(req.params.platformId, {
    action,
    data,
    priority: priority || 'normal'
  });

  if (!sent) {
    return res.status(503).json({
      success: false,
      error: 'Failed to send command. Platform may be offline.'
    });
  }

  res.json({
    success: true,
    message: 'Command sent successfully'
  });
});

/**
 * @route POST /api/command-center/broadcast
 * @desc Broadcast message to all platforms
 */
router.post('/broadcast', verifyCommandCenterAuth, (req, res) => {
  const { type, data, excludePlatforms } = req.body;

  if (!type || !data) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: type, data'
    });
  }

  commandCenter.broadcastToAllPlatforms({
    type,
    data,
    excludePlatforms
  });

  res.json({
    success: true,
    message: 'Broadcast sent to all connected platforms'
  });
});

/**
 * @route GET /api/command-center/metrics
 * @desc Get aggregated metrics from all platforms
 */
router.get('/metrics', verifyCommandCenterAuth, (req, res) => {
  const metrics = commandCenter.getAggregatedMetrics();

  res.json({
    success: true,
    data: metrics
  });
});

/**
 * @route GET /api/command-center/events
 * @desc Get recent events
 */
router.get('/events', verifyCommandCenterAuth, (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const events = commandCenter.getRecentEvents(limit);

  res.json({
    success: true,
    data: {
      count: events.length,
      events
    }
  });
});

/**
 * @route GET /api/command-center/events/:platformId
 * @desc Get events for a specific platform
 */
router.get('/events/:platformId', verifyCommandCenterAuth, (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const events = commandCenter.getPlatformEvents(req.params.platformId, limit);

  res.json({
    success: true,
    data: {
      platformId: req.params.platformId,
      count: events.length,
      events
    }
  });
});

// Platform self-service endpoints (require platform auth)

/**
 * @route PUT /api/command-center/self/status
 * @desc Update own platform status
 */
router.put('/self/status', verifyPlatformAuth, (req, res) => {
  const platformId = (req as any).platformId;
  const { status, metrics } = req.body;

  commandCenter.updatePlatformStatus(platformId, { status, metrics });

  res.json({
    success: true,
    message: 'Status updated'
  });
});

/**
 * @route POST /api/command-center/self/heartbeat
 * @desc Send heartbeat
 */
router.post('/self/heartbeat', verifyPlatformAuth, (req, res) => {
  const platformId = (req as any).platformId;
  const { metrics } = req.body;

  commandCenter.updatePlatformStatus(platformId, { metrics });

  res.json({
    success: true,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route POST /api/command-center/cleanup/duplicates
 * @desc Remove duplicate platform registrations
 */
router.post('/cleanup/duplicates', verifyCommandCenterAuth, async (req, res) => {
  try {
    const result = await commandCenter.removeDuplicatePlatforms();

    res.json({
      success: true,
      data: result,
      message: `Removed ${result.removed} duplicate registrations, kept ${result.kept} platforms`
    });
  } catch (error) {
    console.error('[CommandCenter] Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup duplicates'
    });
  }
});

/**
 * @route DELETE /api/command-center/platforms/:platformId
 * @desc Remove a specific platform
 */
router.delete('/platforms/:platformId', verifyCommandCenterAuth, async (req, res) => {
  try {
    const removed = await commandCenter.removePlatform(req.params.platformId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Platform not found'
      });
    }

    res.json({
      success: true,
      message: 'Platform removed successfully'
    });
  } catch (error) {
    console.error('[CommandCenter] Remove platform error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove platform'
    });
  }
});

export default router;
