import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const meetingsListRegistrantsCommand: CommandDefinition = {
  name: 'meetings_list_registrants',
  group: 'meetings',
  subcommand: 'list-registrants',
  description: 'List registrants for a meeting that has registration enabled.',
  examples: [
    'zoom meetings list-registrants 12345678901',
    'zoom meetings list-registrants 12345678901 --status approved',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID'),
    status: z.enum(['pending', 'approved', 'denied']).optional()
      .describe('Filter by registrant status'),
    page_size: z.coerce.number().min(1).max(300).optional()
      .describe('Results per page'),
    next_page_token: z.string().optional()
      .describe('Pagination token'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'status', flags: '--status <status>', description: 'pending|approved|denied' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },

  endpoint: { method: 'GET', path: '/meetings/{meetingId}/registrants' },

  fieldMappings: {
    meetingId: 'path',
    status: 'query',
    page_size: 'query',
    next_page_token: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(meetingsListRegistrantsCommand, input, client),
};
