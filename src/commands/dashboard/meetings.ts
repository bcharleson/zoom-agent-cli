import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const dashboardMeetingsCommand: CommandDefinition = {
  name: 'dashboard_meetings',
  group: 'dashboard',
  subcommand: 'meetings',
  description: 'List live or past meetings from the dashboard (admin). Provides quality metrics.',
  examples: ['zoom dashboard meetings --type live', 'zoom dashboard meetings --from 2026-03-01 --to 2026-03-11'],

  inputSchema: z.object({
    type: z.enum(['live', 'past', 'pastOne']).optional().describe('live|past|pastOne'),
    from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
    include_fields: z.string().optional().describe('Additional fields'),
  }),

  cliMappings: {
    options: [
      { field: 'type', flags: '-t, --type <type>', description: 'live|past|pastOne' },
      { field: 'from', flags: '--from <date>', description: 'Start date' },
      { field: 'to', flags: '--to <date>', description: 'End date' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'include_fields', flags: '--include-fields <fields>', description: 'Additional fields' },
    ],
  },

  endpoint: { method: 'GET', path: '/metrics/meetings' },
  fieldMappings: { type: 'query', from: 'query', to: 'query', page_size: 'query', next_page_token: 'query', include_fields: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(dashboardMeetingsCommand, input, client),
};
