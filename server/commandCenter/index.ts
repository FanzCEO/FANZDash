/**
 * FanzDash Central Command Center
 * Main entry point for the command center module
 *
 * URL: dash.Fanz.Website
 */

export { commandCenter, CentralCommandCenter } from './platformConnector';
export type {
  ConnectedPlatform,
  PlatformType,
  PlatformMetrics,
  PlatformEvent,
  CommandCenterConfig
} from './platformConnector';

export { default as commandCenterRoutes } from './routes';

export { FanzPlatformSDK } from './platformSDK';
export type {
  PlatformSDKConfig,
  PlatformCommand,
  EventSeverity
} from './platformSDK';
