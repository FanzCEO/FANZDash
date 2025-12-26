#!/usr/bin/env node
// Prevent execution from cloud sync folders
const path = require('path');
const cwd = process.cwd();

const blockedPaths = [
  '/Users/wyattcole/Dropbox',
  '/Users/wyattcole/Library/Mobile Documents',
  '/Users/wyattcole/Box',
  '/Users/wyattcole/Google Drive',
  '/Users/wyattcole/OneDrive'
];

for (const blocked of blockedPaths) {
  if (cwd.startsWith(blocked)) {
    console.error('\x1b[31m%s\x1b[0m', '╔════════════════════════════════════════════════════════════╗');
    console.error('\x1b[31m%s\x1b[0m', '║  ERROR: Cannot execute from cloud sync folder!             ║');
    console.error('\x1b[31m%s\x1b[0m', '║                                                             ║');
    console.error('\x1b[31m%s\x1b[0m', '║  This directory is for development/backup only.            ║');
    console.error('\x1b[31m%s\x1b[0m', '║  Production runs on server at /opt/fanzdash/               ║');
    console.error('\x1b[31m%s\x1b[0m', '║                                                             ║');
    console.error('\x1b[31m%s\x1b[0m', '║  To deploy: npm run build && deploy to server              ║');
    console.error('\x1b[31m%s\x1b[0m', '╚════════════════════════════════════════════════════════════╝');
    process.exit(1);
  }
}
console.log('✓ Execution path check passed');
