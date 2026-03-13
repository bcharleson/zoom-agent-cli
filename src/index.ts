import { Command } from 'commander';
import { registerAllCommands } from './commands/index.js';

const program = new Command();

program
  .name('zoom')
  .description('CLI and MCP server for the Zoom video communications platform')
  .version('0.1.0')
  .option('--account-id <id>', 'Zoom Account ID (overrides ZOOM_ACCOUNT_ID env var)')
  .option('--client-id <id>', 'Zoom Client ID (overrides ZOOM_CLIENT_ID env var)')
  .option('--client-secret <secret>', 'Zoom Client Secret (overrides ZOOM_CLIENT_SECRET env var)')
  .option('--output <format>', 'Output format: json (default) or pretty', 'json')
  .option('--pretty', 'Shorthand for --output pretty')
  .option('--quiet', 'Suppress output, exit codes only')
  .option('--fields <fields>', 'Comma-separated list of fields to include in output');

registerAllCommands(program);

program.parse();
