/**
 * FanzDash Platform SDK
 * Use this SDK to connect your platform to the Central Command Center
 * at dash.Fanz.Website
 *
 * Installation: Copy this file to your platform's codebase
 *
 * Usage:
 * ```typescript
 * import { FanzPlatformSDK } from './platformSDK';
 *
 * const sdk = new FanzPlatformSDK({
 *   platformId: 'plt_your_platform_id',
 *   apiKey: 'fanz_your_api_key',
 *   commandCenterUrl: 'https://dash.Fanz.Website'
 * });
 *
 * await sdk.connect();
 * sdk.sendMetrics({ activeUsers: 100 });
 * ```
 */

import WebSocket from 'ws';

export interface PlatformSDKConfig {
  platformId: string;
  apiKey: string;
  commandCenterUrl: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onCommand?: (command: PlatformCommand) => void;
  onError?: (error: Error) => void;
}

export interface PlatformMetrics {
  activeUsers?: number;
  requestsPerMinute?: number;
  errorRate?: number;
  avgResponseTime?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  bandwidth?: number;
  custom?: Record<string, number>;
}

export interface PlatformCommand {
  id: string;
  action: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: string;
}

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical' | 'success';

export class FanzPlatformSDK {
  private config: Required<PlatformSDKConfig>;
  private ws: WebSocket | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private metrics: PlatformMetrics = {};

  constructor(config: PlatformSDKConfig) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 5000,
      heartbeatInterval: 30000,
      onConnect: () => {},
      onDisconnect: () => {},
      onCommand: () => {},
      onError: () => {},
      ...config
    };
  }

  /**
   * Connect to the Central Command Center
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.buildWebSocketUrl();

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          console.log('🔗 Connected to FanzDash Command Center');
          this.isConnected = true;
          this.startHeartbeat();
          this.config.onConnect();
          resolve();
        });

        this.ws.on('message', (data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', () => {
          console.log('🔌 Disconnected from Command Center');
          this.isConnected = false;
          this.stopHeartbeat();
          this.config.onDisconnect();

          if (this.config.autoReconnect) {
            this.scheduleReconnect();
          }
        });

        this.ws.on('error', (error) => {
          console.error('Command Center connection error:', error);
          this.config.onError(error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the Command Center
   */
  disconnect(): void {
    this.config.autoReconnect = false;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
  }

  /**
   * Check if connected to Command Center
   */
  isConnectedToCommandCenter(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send metrics to Command Center
   */
  sendMetrics(metrics: PlatformMetrics): void {
    this.metrics = { ...this.metrics, ...metrics };
    this.send({
      type: 'metrics',
      data: this.metrics
    });
  }

  /**
   * Report an event to Command Center
   */
  reportEvent(
    severity: EventSeverity,
    category: string,
    message: string,
    data?: any
  ): void {
    this.send({
      type: 'event',
      level: severity,
      category,
      message,
      data
    });
  }

  /**
   * Send an alert to Command Center
   */
  sendAlert(
    severity: EventSeverity,
    message: string,
    data?: any
  ): void {
    this.send({
      type: 'alert',
      severity,
      message,
      data
    });
  }

  /**
   * Update platform status
   */
  updateStatus(status: 'online' | 'degraded' | 'maintenance'): void {
    this.send({
      type: 'status_change',
      status
    });
  }

  /**
   * Send custom message to Command Center
   */
  sendCustomMessage(type: string, data: any): void {
    this.send({ type, data });
  }

  /**
   * Make HTTP request to Command Center API
   */
  async apiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const url = `${this.config.commandCenterUrl}/api/command-center${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Id': this.config.platformId,
        'X-Platform-Key': this.config.apiKey
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get Command Center status
   */
  async getCommandCenterStatus(): Promise<any> {
    return this.apiRequest('/status');
  }

  /**
   * Send heartbeat via HTTP (backup when WebSocket is down)
   */
  async sendHeartbeatHttp(): Promise<void> {
    await this.apiRequest('/self/heartbeat', 'POST', {
      metrics: this.metrics
    });
  }

  // Private methods

  private buildWebSocketUrl(): string {
    const baseUrl = this.config.commandCenterUrl
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');

    return `${baseUrl}/command-center/ws?platformId=${this.config.platformId}&apiKey=${this.config.apiKey}`;
  }

  private handleMessage(data: WebSocket.RawData): void {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'command':
          this.config.onCommand(message as PlatformCommand);
          break;

        case 'heartbeat_ack':
          // Heartbeat acknowledged
          break;

        case 'broadcast':
          console.log('Received broadcast from Command Center:', message.data);
          break;

        default:
          console.log('Received message from Command Center:', message);
      }
    } catch (error) {
      console.error('Error parsing Command Center message:', error);
    }
  }

  private send(message: any): void {
    if (!this.isConnectedToCommandCenter()) {
      console.warn('Not connected to Command Center. Message queued.');
      return;
    }

    try {
      this.ws?.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error sending message to Command Center:', error);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      this.send({
        type: 'heartbeat',
        metrics: this.metrics
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    console.log(`Reconnecting to Command Center in ${this.config.reconnectInterval}ms...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
        this.scheduleReconnect();
      });
    }, this.config.reconnectInterval);
  }
}

// Export for CommonJS compatibility
export default FanzPlatformSDK;
