import { startMcpServer } from './mcp/server.js';

// Direct MCP entry point — can be used as:
// node dist/mcp.js
// or in MCP config: { "command": "node", "args": ["path/to/dist/mcp.js"] }

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

startMcpServer().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Failed to start MCP server:', message);
  if (String(message).includes('credentials')) {
    console.error('Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET or run: zoom login');
  }
  process.exit(1);
});
