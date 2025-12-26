/**
 * FanzDash Central Command Center - Platform Connector
 * Manages connections from all Fanz platforms to the central dashboard
 * URL: dash.Fanz.Website
 *
 * Now with persistent database storage for platform registrations
 */

import { WebSocket, WebSocketServer } from 'ws';
import crypto from 'crypto';
import { db } from '../db';
import { connectedPlatforms, platformEvents } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Platform types that can connect to the command center
export type PlatformType =
  | 'main-website'      // fanz.website
  | 'creator-portal'    // creator.fanz.website
  | 'admin-panel'       // admin.fanz.website
  | 'mobile-app'        // Mobile applications
  | 'streaming-service' // Streaming platform
  | 'payment-gateway'   // Payment processing
  | 'cdn-node'          // CDN distribution nodes
  | 'analytics-engine'  // Analytics service
  | 'moderation-ai'     // AI moderation service
  | 'custom';           // Custom integrations

export interface ConnectedPlatform {
  id: string;
  name: string;
  type: PlatformType;
  url: string;
  apiKey: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  lastHeartbeat: Date;
  connectedAt: Date;
  version: string;
  capabilities: string[];
  metrics: PlatformMetrics;
  websocket?: WebSocket;
}

export interface PlatformMetrics {
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  bandwidth: number;
}

export interface PlatformEvent {
  id: string;
  platformId: string;
  type: 'info' | 'warning' | 'error' | 'critical' | 'success';
  category: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export interface CommandCenterConfig {
  apiKey: string;
  allowedOrigins: string[];
  heartbeatInterval: number;  // ms
  heartbeatTimeout: number;   // ms
  maxPlatforms: number;
  enableMetrics: boolean;
  enableAlerts: boolean;
}

class CentralCommandCenter {
  private platforms: Map<string, ConnectedPlatform> = new Map();
  private events: PlatformEvent[] = [];
  private wss: WebSocketServer | null = null;
  private config: CommandCenterConfig;
  private heartbeatCheckers: Map<string, NodeJS.Timeout> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.config = {
      apiKey: process.env.COMMAND_CENTER_API_KEY || this.generateApiKey(),
      allowedOrigins: (process.env.ALLOWED_PLATFORM_ORIGINS || '').split(',').filter(Boolean),
      heartbeatInterval: 30000,  // 30 seconds
      heartbeatTimeout: 90000,   // 90 seconds
      maxPlatforms: 100,
      enableMetrics: true,
      enableAlerts: true
    };

    // Start periodic cleanup
    setInterval(() => this.cleanupStaleConnections(), 60000);

    // Load platforms from database on startup
    this.loadPlatformsFromDatabase();
  }

  /**
   * Load all registered platforms from database
   */
  private async loadPlatformsFromDatabase(): Promise<void> {
    try {
      const dbPlatforms = await db.select().from(connectedPlatforms);

      for (const p of dbPlatforms) {
        const platform: ConnectedPlatform = {
          id: p.id,
          name: p.name,
          type: p.type as PlatformType,
          url: p.url,
          apiKey: p.apiKey,
          status: (p.status as ConnectedPlatform['status']) || 'offline',
          lastHeartbeat: p.lastHeartbeat || new Date(),
          connectedAt: p.connectedAt || new Date(),
          version: p.version || '1.0.0',
          capabilities: (p.capabilities as string[]) || [],
          metrics: (p.metrics as PlatformMetrics) || this.getDefaultMetrics()
        };
        this.platforms.set(p.id, platform);
      }

      this.initialized = true;
      console.log(`🎛️  Command Center: Loaded ${dbPlatforms.length} platforms from database`);
    } catch (error) {
      console.error('Failed to load platforms from database:', error);
      this.initialized = true; // Continue anyway with empty platforms
    }
  }

  /**
   * Save platform to database
   */
  private async savePlatformToDatabase(platform: ConnectedPlatform): Promise<void> {
    try {
      await db.insert(connectedPlatforms).values({
        id: platform.id,
        name: platform.name,
        type: platform.type,
        url: platform.url,
        apiKey: platform.apiKey,
        status: platform.status,
        version: platform.version,
        capabilities: platform.capabilities,
        lastHeartbeat: platform.lastHeartbeat,
        connectedAt: platform.connectedAt,
        metrics: platform.metrics,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: connectedPlatforms.id,
        set: {
          status: platform.status,
          lastHeartbeat: platform.lastHeartbeat,
          metrics: platform.metrics,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to save platform to database:', error);
    }
  }

  /**
   * Update platform in database
   */
  private async updatePlatformInDatabase(platformId: string, updates: Partial<ConnectedPlatform>): Promise<void> {
    try {
      await db.update(connectedPlatforms)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(connectedPlatforms.id, platformId));
    } catch (error) {
      console.error('Failed to update platform in database:', error);
    }
  }

  /**
   * Save event to database
   */
  private async saveEventToDatabase(event: PlatformEvent): Promise<void> {
    try {
      await db.insert(platformEvents).values({
        id: event.id,
        platformId: event.platformId,
        type: event.type,
        category: event.category,
        message: event.message,
        data: event.data,
        timestamp: event.timestamp
      });
    } catch (error) {
      // Don't log every event save failure, just silently continue
    }
  }

  /**
   * Initialize WebSocket server for real-time platform connections
   */
  initializeWebSocket(server: any): void {
    // Use noServer mode - upgrade is handled externally by routes.ts
    // Disable per-message deflate compression
    this.wss = new WebSocketServer({
      noServer: true,
      perMessageDeflate: false
    });

    this.wss.on('connection', (ws, req) => {
      const platformId = this.handleNewConnection(ws, req);

      ws.on('message', (data) => this.handlePlatformMessage(platformId, data));
      ws.on('close', () => this.handleDisconnection(platformId));
      ws.on('error', (error) => this.handleConnectionError(platformId, error));
    });

    console.log('🎛️  Central Command Center WebSocket initialized at /command-center/ws');
  }

  /**
   * Handle WebSocket upgrade for command center path
   * Called from routes.ts centralized upgrade handler
   */
  handleUpgrade(request: any, socket: any, head: any): void {
    if (this.wss) {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss!.emit('connection', ws, request);
      });
    }
  }

  /**
   * Register a new platform with the command center
   */
  async registerPlatform(registration: {
    name: string;
    type: PlatformType;
    url: string;
    version: string;
    capabilities: string[];
  }): Promise<{ platformId: string; apiKey: string }> {
    const platformId = this.generatePlatformId();
    const apiKey = this.generateApiKey();

    const platform: ConnectedPlatform = {
      id: platformId,
      name: registration.name,
      type: registration.type,
      url: registration.url,
      apiKey,
      status: 'offline',
      lastHeartbeat: new Date(),
      connectedAt: new Date(),
      version: registration.version,
      capabilities: registration.capabilities,
      metrics: this.getDefaultMetrics()
    };

    this.platforms.set(platformId, platform);

    // Save to database for persistence
    await this.savePlatformToDatabase(platform);

    this.logEvent(platformId, 'success', 'registration', `Platform "${registration.name}" registered successfully`);

    return { platformId, apiKey };
  }

  /**
   * Authenticate a platform connection
   */
  authenticatePlatform(platformId: string, apiKey: string): boolean {
    const platform = this.platforms.get(platformId);
    if (!platform) return false;

    // Constant-time comparison to prevent timing attacks
    const keyBuffer = Buffer.from(apiKey);
    const storedBuffer = Buffer.from(platform.apiKey);

    if (keyBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, storedBuffer);
  }

  /**
   * Update platform status and metrics
   */
  updatePlatformStatus(platformId: string, update: {
    status?: ConnectedPlatform['status'];
    metrics?: Partial<PlatformMetrics>;
  }): void {
    const platform = this.platforms.get(platformId);
    if (!platform) return;

    if (update.status) {
      platform.status = update.status;
    }

    if (update.metrics) {
      platform.metrics = { ...platform.metrics, ...update.metrics };
    }

    platform.lastHeartbeat = new Date();
    this.platforms.set(platformId, platform);

    // Update in database (async, don't wait)
    this.updatePlatformInDatabase(platformId, {
      status: platform.status,
      metrics: platform.metrics,
      lastHeartbeat: platform.lastHeartbeat
    });

    // Broadcast update to dashboard clients
    this.broadcastToDashboard({
      type: 'platform_update',
      platformId,
      data: { status: platform.status, metrics: platform.metrics }
    });
  }

  /**
   * Send command to a specific platform
   */
  sendCommand(platformId: string, command: {
    action: string;
    data?: any;
    priority?: 'low' | 'normal' | 'high' | 'critical';
  }): boolean {
    const platform = this.platforms.get(platformId);
    if (!platform || !platform.websocket) return false;

    try {
      platform.websocket.send(JSON.stringify({
        type: 'command',
        id: crypto.randomUUID(),
        ...command,
        timestamp: new Date().toISOString()
      }), { compress: false });
      return true;
    } catch (error) {
      this.logEvent(platformId, 'error', 'command', `Failed to send command: ${error}`);
      return false;
    }
  }

  /**
   * Broadcast message to all connected platforms
   */
  broadcastToAllPlatforms(message: {
    type: string;
    data: any;
    excludePlatforms?: string[];
  }): void {
    this.platforms.forEach((platform, platformId) => {
      if (message.excludePlatforms?.includes(platformId)) return;
      if (!platform.websocket || platform.status === 'offline') return;

      try {
        platform.websocket.send(JSON.stringify({
          ...message,
          timestamp: new Date().toISOString()
        }), { compress: false });
      } catch (error) {
        console.error(`Failed to broadcast to platform ${platformId}:`, error);
      }
    });
  }

  /**
   * Get all connected platforms
   */
  getAllPlatforms(): ConnectedPlatform[] {
    return Array.from(this.platforms.values()).map(p => ({
      ...p,
      websocket: undefined,
      apiKey: '***REDACTED***'
    }));
  }

  /**
   * Get platform by ID
   */
  getPlatform(platformId: string): ConnectedPlatform | undefined {
    const platform = this.platforms.get(platformId);
    if (!platform) return undefined;

    return {
      ...platform,
      websocket: undefined,
      apiKey: '***REDACTED***'
    };
  }

  /**
   * Get aggregated metrics from all platforms
   */
  getAggregatedMetrics(): {
    totalActiveUsers: number;
    totalRequestsPerMinute: number;
    avgErrorRate: number;
    avgResponseTime: number;
    platformCount: number;
    onlinePlatforms: number;
    degradedPlatforms: number;
    offlinePlatforms: number;
  } {
    const platforms = Array.from(this.platforms.values());
    const onlinePlatforms = platforms.filter(p => p.status === 'online');

    return {
      totalActiveUsers: platforms.reduce((sum, p) => sum + p.metrics.activeUsers, 0),
      totalRequestsPerMinute: platforms.reduce((sum, p) => sum + p.metrics.requestsPerMinute, 0),
      avgErrorRate: onlinePlatforms.length > 0
        ? onlinePlatforms.reduce((sum, p) => sum + p.metrics.errorRate, 0) / onlinePlatforms.length
        : 0,
      avgResponseTime: onlinePlatforms.length > 0
        ? onlinePlatforms.reduce((sum, p) => sum + p.metrics.avgResponseTime, 0) / onlinePlatforms.length
        : 0,
      platformCount: platforms.length,
      onlinePlatforms: platforms.filter(p => p.status === 'online').length,
      degradedPlatforms: platforms.filter(p => p.status === 'degraded').length,
      offlinePlatforms: platforms.filter(p => p.status === 'offline').length
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): PlatformEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events for a specific platform
   */
  getPlatformEvents(platformId: string, limit: number = 50): PlatformEvent[] {
    return this.events
      .filter(e => e.platformId === platformId)
      .slice(-limit);
  }

  // Private methods

  private handleNewConnection(ws: WebSocket, req: any): string {
    const url = new URL(req.url, `ws://${req.headers.host}`);
    const platformId = url.searchParams.get('platformId') || '';
    const apiKey = url.searchParams.get('apiKey') || '';

    if (!this.authenticatePlatform(platformId, apiKey)) {
      ws.close(4001, 'Authentication failed');
      return '';
    }

    const platform = this.platforms.get(platformId);
    if (platform) {
      platform.websocket = ws;
      platform.status = 'online';
      platform.connectedAt = new Date();
      platform.lastHeartbeat = new Date();
      this.platforms.set(platformId, platform);

      // Update database
      this.updatePlatformInDatabase(platformId, {
        status: 'online',
        connectedAt: platform.connectedAt,
        lastHeartbeat: platform.lastHeartbeat
      });

      // Setup heartbeat checker
      this.setupHeartbeatChecker(platformId);

      this.logEvent(platformId, 'success', 'connection', `Platform connected`);

      // Send welcome message directly to the new connection only
      try {
        ws.send(JSON.stringify({
          type: 'welcome',
          platformId,
          message: 'Connected to Command Center',
          timestamp: new Date().toISOString()
        }), { compress: false });
      } catch (e) {
        console.error('Error sending welcome:', e);
      }
    }

    return platformId;
  }

  private handlePlatformMessage(platformId: string, data: any): void {
    try {
      const message = JSON.parse(data.toString());
      const platform = this.platforms.get(platformId);

      if (!platform) return;

      switch (message.type) {
        case 'heartbeat':
          platform.lastHeartbeat = new Date();
          if (message.metrics) {
            platform.metrics = { ...platform.metrics, ...message.metrics };
          }
          platform.status = 'online';
          this.platforms.set(platformId, platform);

          // Update database periodically (every heartbeat)
          this.updatePlatformInDatabase(platformId, {
            lastHeartbeat: platform.lastHeartbeat,
            metrics: platform.metrics,
            status: 'online'
          });
          break;

        case 'metrics':
          this.updatePlatformStatus(platformId, { metrics: message.data });
          break;

        case 'event':
          this.logEvent(platformId, message.level, message.category, message.message, message.data);
          break;

        case 'alert':
          this.handlePlatformAlert(platformId, message);
          break;

        case 'status_change':
          this.updatePlatformStatus(platformId, { status: message.status });
          break;

        default:
          // Forward unknown messages to dashboard
          this.broadcastToDashboard({
            type: 'platform_message',
            platformId,
            data: message
          });
      }
    } catch (error) {
      console.error(`Error handling message from platform ${platformId}:`, error);
    }
  }

  private handleDisconnection(platformId: string): void {
    const platform = this.platforms.get(platformId);
    if (platform) {
      platform.status = 'offline';
      platform.websocket = undefined;
      this.platforms.set(platformId, platform);

      // Update database
      this.updatePlatformInDatabase(platformId, { status: 'offline' });

      this.clearHeartbeatChecker(platformId);
      this.logEvent(platformId, 'warning', 'connection', 'Platform disconnected');

      this.broadcastToDashboard({
        type: 'platform_disconnected',
        platformId
      });
    }
  }

  private handleConnectionError(platformId: string, error: Error): void {
    this.logEvent(platformId, 'error', 'connection', `Connection error: ${error.message}`);
    this.handleDisconnection(platformId);
  }

  private handlePlatformAlert(platformId: string, alert: any): void {
    this.logEvent(platformId, alert.severity || 'warning', 'alert', alert.message, alert.data);

    // Forward critical alerts to all dashboard clients
    if (alert.severity === 'critical') {
      this.broadcastToDashboard({
        type: 'critical_alert',
        platformId,
        data: alert
      });
    }
  }

  private setupHeartbeatChecker(platformId: string): void {
    this.clearHeartbeatChecker(platformId);

    const checker = setInterval(() => {
      const platform = this.platforms.get(platformId);
      if (!platform) {
        this.clearHeartbeatChecker(platformId);
        return;
      }

      const timeSinceHeartbeat = Date.now() - platform.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > this.config.heartbeatTimeout) {
        platform.status = 'offline';
        this.platforms.set(platformId, platform);
        this.updatePlatformInDatabase(platformId, { status: 'offline' });
        this.logEvent(platformId, 'error', 'heartbeat', 'Platform heartbeat timeout');
        this.broadcastToDashboard({
          type: 'platform_timeout',
          platformId
        });
      } else if (timeSinceHeartbeat > this.config.heartbeatInterval * 2) {
        platform.status = 'degraded';
        this.platforms.set(platformId, platform);
        this.updatePlatformInDatabase(platformId, { status: 'degraded' });
      }
    }, this.config.heartbeatInterval);

    this.heartbeatCheckers.set(platformId, checker);
  }

  private clearHeartbeatChecker(platformId: string): void {
    const checker = this.heartbeatCheckers.get(platformId);
    if (checker) {
      clearInterval(checker);
      this.heartbeatCheckers.delete(platformId);
    }
  }

  private cleanupStaleConnections(): void {
    const staleThreshold = Date.now() - (this.config.heartbeatTimeout * 2);

    this.platforms.forEach((platform, platformId) => {
      if (platform.lastHeartbeat.getTime() < staleThreshold && platform.status !== 'maintenance') {
        platform.status = 'offline';
        this.platforms.set(platformId, platform);
        this.updatePlatformInDatabase(platformId, { status: 'offline' });
      }
    });
  }

  private broadcastToDashboard(message: any): void {
    // This would broadcast to dashboard WebSocket clients
    // Implementation depends on how dashboard clients connect
    if (this.wss) {
      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            ...message,
            timestamp: new Date().toISOString()
          }), { compress: false });
        }
      });
    }
  }

  private logEvent(
    platformId: string,
    type: PlatformEvent['type'],
    category: string,
    message: string,
    data?: any
  ): void {
    const event: PlatformEvent = {
      id: crypto.randomUUID(),
      platformId,
      type,
      category,
      message,
      data,
      timestamp: new Date()
    };

    this.events.push(event);

    // Keep only last 10000 events in memory
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }

    // Save to database (async)
    this.saveEventToDatabase(event);

    console.log(`[CommandCenter] [${type.toUpperCase()}] [${platformId}] ${message}`);
  }

  private generatePlatformId(): string {
    return `plt_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateApiKey(): string {
    return `fanz_${crypto.randomBytes(32).toString('hex')}`;
  }

  private getDefaultMetrics(): PlatformMetrics {
    return {
      activeUsers: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      avgResponseTime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      bandwidth: 0
    };
  }

  /**
   * Remove duplicate platform registrations, keeping only the most recently active one per URL
   */
  async removeDuplicatePlatforms(): Promise<{ removed: number; kept: number }> {
    const platformsByUrl = new Map<string, ConnectedPlatform[]>();

    // Group platforms by URL
    this.platforms.forEach((platform) => {
      const existing = platformsByUrl.get(platform.url) || [];
      existing.push(platform);
      platformsByUrl.set(platform.url, existing);
    });

    let removed = 0;
    let kept = 0;

    for (const [url, platforms] of platformsByUrl) {
      if (platforms.length <= 1) {
        kept++;
        continue;
      }

      // Sort by: online status first, then by lastHeartbeat (most recent first)
      platforms.sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (b.status === 'online' && a.status !== 'online') return 1;
        return b.lastHeartbeat.getTime() - a.lastHeartbeat.getTime();
      });

      // Keep the first one (best candidate), remove the rest
      const toKeep = platforms[0];
      kept++;

      for (let i = 1; i < platforms.length; i++) {
        const toRemove = platforms[i];

        // Remove from memory
        this.platforms.delete(toRemove.id);

        // Remove from database
        try {
          await db.delete(connectedPlatforms).where(eq(connectedPlatforms.id, toRemove.id));
        } catch (error) {
          console.error(`[CommandCenter] Failed to delete platform ${toRemove.id}:`, error);
        }

        // Stop heartbeat checker
        const checker = this.heartbeatCheckers.get(toRemove.id);
        if (checker) {
          clearInterval(checker);
          this.heartbeatCheckers.delete(toRemove.id);
        }

        removed++;

        this.logEvent(
          toRemove.id,
          'info',
          'cleanup',
          `Removed duplicate platform registration for ${url}`,
          { keptPlatformId: toKeep.id }
        );
      }
    }

    console.log(`[CommandCenter] Cleanup complete: removed ${removed} duplicates, kept ${kept} platforms`);
    return { removed, kept };
  }

  /**
   * Remove a specific platform by ID
   */
  async removePlatform(platformId: string): Promise<boolean> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      return false;
    }

    // Remove from memory
    this.platforms.delete(platformId);

    // Remove from database
    try {
      await db.delete(connectedPlatforms).where(eq(connectedPlatforms.id, platformId));
    } catch (error) {
      console.error(`[CommandCenter] Failed to delete platform ${platformId}:`, error);
      return false;
    }

    // Stop heartbeat checker
    const checker = this.heartbeatCheckers.get(platformId);
    if (checker) {
      clearInterval(checker);
      this.heartbeatCheckers.delete(platformId);
    }

    this.logEvent(platformId, 'info', 'deregistration', `Platform ${platform.name} removed`);
    return true;
  }
}

// Export singleton instance
export const commandCenter = new CentralCommandCenter();
export default commandCenter;
