import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const reportsOperationLogsCommand: CommandDefinition = {
  name: 'reports_operation_logs',
  group: 'reports',
  subcommand: 'operation-logs',
  description: 'Get operation logs report showing admin actions on the account.',
  examples: ['zoom reports operation-logs --from 2026-03-01 --to 2026-03-11'],

  inputSchema: z.object({
    from: z.string().describe('Start date (YYYY-MM-DD)'),
    to: z.string().describe('End date (YYYY-MM-DD)'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
    category_type: z.string().optional().describe('Filter by category'),
  }),

  cliMappings: {
    options: [
      { field: 'from', flags: '--from <date>', description: 'Start date (required)' },
      { field: 'to', flags: '--to <date>', description: 'End date (required)' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'category_type', flags: '--category <type>', description: 'Filter by category' },
    ],
  },

  endpoint: { method: 'GET', path: '/report/operationlogs' },
  fieldMappings: { from: 'query', to: 'query', page_size: 'query', next_page_token: 'query', category_type: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(reportsOperationLogsCommand, input, client),
};
