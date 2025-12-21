// @ts-nocheck
/**
 * Platform Management Routes for FanzDash Central Command Center
 *
 * Handles platform registration, heartbeats, metrics, and management
 */

import { Express, Request, Response } from 'express';

// In-memory store for connected platforms (in production, use Redis or database)
interface Platform {
  platformId: string;
  platformName: string;
  platformUrl: string;
  healthEndpoint: string;
  metricsEndpoint: string;
  webhookEndpoint: string;
  features: string[];
  version: string;
  status: 'online' | 'offline' | 'degraded';
  lastHeartbeat: Date;
  registeredAt: Date;
  metrics?: any;
}

const connectedPlatforms: Map<string, Platform> = new Map();

export function registerPlatformRoutes(app: Express) {

  /**
   * Register a platform with FanzDash
   * POST /api/platforms/register
   */
  app.post('/api/platforms/register', async (req: Request, res: Response) => {
    try {
      const {
        platformId,
        platformName,
        platformUrl,
        healthEndpoint,
        metricsEndpoint,
        webhookEndpoint,
        features,
        version,
        registeredAt
      } = req.body;

      if (!platformId || !platformName || !platformUrl) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: platformId, platformName, platformUrl'
        });
      }

      const platform: Platform = {
        platformId,
        platformName,
        platformUrl,
        healthEndpoint: healthEndpoint || `${platformUrl}/api/health`,
        metricsEndpoint: metricsEndpoint || `${platformUrl}/api/metrics`,
        webhookEndpoint: webhookEndpoint || `${platformUrl}/api/webhooks/fanzdash`,
        features: features || [],
        version: version || '1.0.0',
        status: 'online',
        lastHeartbeat: new Date(),
        registeredAt: registeredAt ? new Date(registeredAt) : new Date()
      };

      connectedPlatforms.set(platformId, platform);

      console.log(`[FanzDash] Platform registered: ${platformName} (${platformId})`);

      res.json({
        success: true,
        message: `Platform ${platformName} registered successfully`,
        data: {
          platformId,
          status: 'registered',
          dashboardUrl: `https://dash.fanz.website/platforms/${platformId}`
        }
      });
    } catch (error) {
      console.error('[FanzDash] Platform registration error:', error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  });

  /**
   * Platform heartbeat
   * POST /api/platforms/:platformId/heartbeat
   */
  app.post('/api/platforms/:platformId/heartbeat', (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;
      const { timestamp, status, uptime } = req.body;

      const platform = connectedPlatforms.get(platformId);
      if (platform) {
        platform.lastHeartbeat = new Date();
        platform.status = status || 'online';
        connectedPlatforms.set(platformId, platform);
      }

      res.json({ success: true, received: timestamp });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Heartbeat failed' });
    }
  });

  /**
   * Receive platform metrics
   * POST /api/platforms/:platformId/metrics
   */
  app.post('/api/platforms/:platformId/metrics', (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;
      const { metrics, timestamp } = req.body;

      const platform = connectedPlatforms.get(platformId);
      if (platform) {
        platform.metrics = { ...metrics, updatedAt: timestamp };
        connectedPlatforms.set(platformId, platform);
      }

      res.json({ success: true, received: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Metrics update failed' });
    }
  });

  /**
   * Get platform config
   * GET /api/platforms/:platformId/config
   */
  app.get('/api/platforms/:platformId/config', (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;

      // Return platform-specific configuration
      res.json({
        success: true,
        data: {
          platformId,
          features: {
            sso: true,
            analytics: true,
            moderation: true,
            payments: true
          },
          settings: {
            syncInterval: 30000,
            metricsInterval: 60000
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Config fetch failed' });
    }
  });

  /**
   * Platform disconnect
   * POST /api/platforms/:platformId/disconnect
   */
  app.post('/api/platforms/:platformId/disconnect', (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;

      const platform = connectedPlatforms.get(platformId);
      if (platform) {
        platform.status = 'offline';
        connectedPlatforms.set(platformId, platform);
        console.log(`[FanzDash] Platform disconnected: ${platformId}`);
      }

      res.json({ success: true, message: 'Disconnected' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Disconnect failed' });
    }
  });

  /**
   * Get all connected platforms
   * GET /api/platforms
   */
  app.get('/api/platforms', (req: Request, res: Response) => {
    try {
      const platforms = Array.from(connectedPlatforms.values()).map(p => ({
        platformId: p.platformId,
        platformName: p.platformName,
        platformUrl: p.platformUrl,
        status: p.status,
        lastHeartbeat: p.lastHeartbeat,
        registeredAt: p.registeredAt,
        features: p.features,
        version: p.version,
        metrics: p.metrics
      }));

      res.json({
        success: true,
        data: {
          total: platforms.length,
          online: platforms.filter(p => p.status === 'online').length,
          platforms
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get platforms' });
    }
  });

  /**
   * Get specific platform details
   * GET /api/platforms/:platformId
   */
  app.get('/api/platforms/:platformId', (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;
      const platform = connectedPlatforms.get(platformId);

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
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get platform' });
    }
  });

  /**
   * Send command to platform
   * POST /api/platforms/:platformId/command
   */
  app.post('/api/platforms/:platformId/command', async (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;
      const { action, data } = req.body;

      const platform = connectedPlatforms.get(platformId);
      if (!platform) {
        return res.status(404).json({
          success: false,
          error: 'Platform not found'
        });
      }

      // Send command to platform's webhook endpoint
      const response = await fetch(platform.webhookEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Key': process.env.FANZDASH_MASTER_KEY || 'fanzdash-key',
          'X-Event-Type': 'command'
        },
        body: JSON.stringify({ action, data })
      });

      if (response.ok) {
        const result = await response.json();
        res.json({ success: true, data: result });
      } else {
        res.status(500).json({ success: false, error: 'Command delivery failed' });
      }
    } catch (error) {
      console.error('[FanzDash] Command error:', error);
      res.status(500).json({ success: false, error: 'Command failed' });
    }
  });

  /**
   * Receive platform events
   * POST /api/platforms/:platformId/events
   */
  app.post('/api/platforms/:platformId/events', (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;
      const { events } = req.body;

      const platform = connectedPlatforms.get(platformId);
      if (!platform) {
        return res.status(404).json({ success: false, error: 'Platform not found' });
      }

      // Process events (log, store, analyze)
      console.log(`[FanzDash] Received ${events?.length || 0} events from ${platformId}`);

      // In production, events would be stored in database/analytics system
      // For now, just acknowledge receipt

      res.json({ success: true, received: events?.length || 0 });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Events processing failed' });
    }
  });

  /**
   * Receive platform alerts
   * POST /api/platforms/:platformId/alerts
   */
  app.post('/api/platforms/:platformId/alerts', (req: Request, res: Response) => {
    try {
      const { platformId } = req.params;
      const { type, severity, message, data, timestamp } = req.body;

      console.log(`[FanzDash ALERT] ${severity?.toUpperCase()} from ${platformId}: ${message}`);

      // In production, alerts would trigger notifications, escalations, etc.

      res.json({ success: true, alertId: `alert_${Date.now()}` });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Alert processing failed' });
    }
  });

  /**
   * Broadcast to all platforms
   * POST /api/platforms/broadcast
   */
  app.post('/api/platforms/broadcast', async (req: Request, res: Response) => {
    try {
      const { action, data, targetPlatforms } = req.body;

      const platforms = targetPlatforms
        ? Array.from(connectedPlatforms.values()).filter(p => targetPlatforms.includes(p.platformId))
        : Array.from(connectedPlatforms.values()).filter(p => p.status === 'online');

      const results = await Promise.allSettled(
        platforms.map(async (platform) => {
          try {
            const response = await fetch(platform.webhookEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Platform-Key': process.env.FANZDASH_MASTER_KEY || 'fanzdash-key',
                'X-Event-Type': 'broadcast'
              },
              body: JSON.stringify({ action, data })
            });
            return { platformId: platform.platformId, success: response.ok };
          } catch (error) {
            return { platformId: platform.platformId, success: false };
          }
        })
      );

      res.json({
        success: true,
        data: {
          sent: results.length,
          results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false })
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Broadcast failed' });
    }
  });

  // Check platform health periodically (every 60 seconds)
  setInterval(() => {
    const now = new Date();
    connectedPlatforms.forEach((platform, platformId) => {
      const timeSinceHeartbeat = now.getTime() - platform.lastHeartbeat.getTime();
      if (timeSinceHeartbeat > 120000) { // 2 minutes without heartbeat
        platform.status = 'offline';
        connectedPlatforms.set(platformId, platform);
      } else if (timeSinceHeartbeat > 60000) { // 1 minute without heartbeat
        platform.status = 'degraded';
        connectedPlatforms.set(platformId, platform);
      }
    });
  }, 60000);

  console.log('[FanzDash] Platform management routes registered');
}

// Export for use in other modules
export function getConnectedPlatforms() {
  return Array.from(connectedPlatforms.values());
}

export function getPlatformById(platformId: string) {
  return connectedPlatforms.get(platformId);
}
