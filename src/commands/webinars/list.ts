import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const webinarsListCommand: CommandDefinition = {
  name: 'webinars_list',
  group: 'webinars',
  subcommand: 'list',
  description: 'List webinars for a user.',
  examples: ['zoom webinars list --user-id me'],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email'),
    type: z.enum(['scheduled', 'upcoming']).optional().describe('Webinar type filter'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email' },
      { field: 'type', flags: '-t, --type <type>', description: 'scheduled|upcoming' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },

  endpoint: { method: 'GET', path: '/users/{userId}/webinars' },
  fieldMappings: { userId: 'path', type: 'query', page_size: 'query', next_page_token: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(webinarsListCommand, input, client),
};
