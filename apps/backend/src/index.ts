#!/usr/bin/env node
import 'dotenv/config';

// Re-export server entry point for direct tsx execution
import('../src/server.js').catch((err) => {
  console.error('[backend] Failed to start server:', err);
  process.exit(1);
});
