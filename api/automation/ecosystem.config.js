/**
 * FanzDash Automation Engine - PM2 Ecosystem Config
 * Version: 1.0.0
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --only automation-worker
 *   pm2 start ecosystem.config.js --only automation-worker-ts
 */

module.exports = {
  apps: [
    // PHP Worker (if using PHP backend)
    {
      name: 'automation-worker',
      script: 'automation_worker.php',
      interpreter: 'php',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_NAME: process.env.DB_NAME || 'fanz',
        DB_USER: process.env.DB_USER || 'root',
        DB_PASS: process.env.DB_PASS || '',
        DB_PORT: process.env.DB_PORT || '3306',
      },
      // Logs
      error_file: '/var/log/pm2/automation-worker-error.log',
      out_file: '/var/log/pm2/automation-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Restart on crash with exponential backoff
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 4000,
    },

    // TypeScript/Node.js Worker (if using TS backend)
    {
      name: 'automation-worker-ts',
      script: '../../server/automation/worker.ts',
      interpreter: 'ts-node',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
      },
      error_file: '/var/log/pm2/automation-worker-ts-error.log',
      out_file: '/var/log/pm2/automation-worker-ts-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 4000,
    },

    // Compiled JS Worker (for production, after tsc build)
    {
      name: 'automation-worker-prod',
      script: '../../dist/automation/worker.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
      },
      error_file: '/var/log/pm2/automation-worker-prod-error.log',
      out_file: '/var/log/pm2/automation-worker-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 4000,
    },

    // Log cleanup cron job (optional)
    {
      name: 'automation-cleanup',
      script: 'cleanup_logs.php',
      interpreter: 'php',
      cwd: __dirname,
      cron_restart: '0 2 * * *', // Run daily at 2 AM
      autorestart: false,
      watch: false,
      env: {
        CLEANUP_DAYS: '30',
      },
    },
  ],
};
