import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const webinarsListRegistrantsCommand: CommandDefinition = {
  name: 'webinars_list_registrants',
  group: 'webinars',
  subcommand: 'list-registrants',
  description: 'List registrants for a webinar.',
  examples: ['zoom webinars list-registrants 12345678901'],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
    status: z.enum(['pending', 'approved', 'denied']).optional().describe('Filter by status'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
    options: [
      { field: 'status', flags: '--status <status>', description: 'pending|approved|denied' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },

  endpoint: { method: 'GET', path: '/webinars/{webinarId}/registrants' },
  fieldMappings: { webinarId: 'path', status: 'query', page_size: 'query', next_page_token: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(webinarsListRegistrantsCommand, input, client),
};
