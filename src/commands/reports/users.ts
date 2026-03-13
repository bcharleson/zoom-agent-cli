import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const reportsUsersCommand: CommandDefinition = {
  name: 'reports_users',
  group: 'reports',
  subcommand: 'users',
  description: 'Get active/inactive host report for a date range.',
  examples: ['zoom reports users --from 2026-03-01 --to 2026-03-11'],

  inputSchema: z.object({
    from: z.string().describe('Start date (YYYY-MM-DD)'),
    to: z.string().describe('End date (YYYY-MM-DD)'),
    type: z.enum(['active', 'inactive']).optional().describe('User type filter'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
  }),

  cliMappings: {
    options: [
      { field: 'from', flags: '--from <date>', description: 'Start date (required)' },
      { field: 'to', flags: '--to <date>', description: 'End date (required)' },
      { field: 'type', flags: '-t, --type <type>', description: 'active|inactive' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },

  endpoint: { method: 'GET', path: '/report/users' },
  fieldMappings: { from: 'query', to: 'query', type: 'query', page_size: 'query', next_page_token: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(reportsUsersCommand, input, client),
};
