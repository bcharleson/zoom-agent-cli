import { Command } from 'commander';
import { startMcpServer } from '../../mcp/server.js';

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp')
    .description('Start the MCP (Model Context Protocol) server for AI agent integration')
    .action(async () => {
      await startMcpServer();
    });
}
