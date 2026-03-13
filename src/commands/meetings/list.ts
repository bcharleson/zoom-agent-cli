import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const meetingsListCommand: CommandDefinition = {
  name: 'meetings_list',
  group: 'meetings',
  subcommand: 'list',
  description: 'List meetings for a user. Returns scheduled, live, and upcoming meetings. Use userId "me" for the authenticated user.',
  examples: [
    'zoom meetings list --user-id me',
    'zoom meetings list --user-id me --type upcoming',
    'zoom meetings list --user-id user@example.com --page-size 50',
  ],

  inputSchema: z.object({
    userId: z.string().default('me')
      .describe('User ID or email. Use "me" for the authenticated user.'),
    type: z.enum(['scheduled', 'live', 'upcoming', 'upcoming_meetings', 'previous_meetings']).optional()
      .describe('Meeting type filter'),
    page_size: z.coerce.number().min(1).max(300).optional()
      .describe('Number of results per page (max 300)'),
    next_page_token: z.string().optional()
      .describe('Pagination token from previous response'),
    from: z.string().optional()
      .describe('Start date (YYYY-MM-DD) for previous_meetings type'),
    to: z.string().optional()
      .describe('End date (YYYY-MM-DD) for previous_meetings type'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email (default: "me")' },
      { field: 'type', flags: '-t, --type <type>', description: 'scheduled|live|upcoming|upcoming_meetings|previous_meetings' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page (max 300)' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'from', flags: '--from <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'to', flags: '--to <date>', description: 'End date (YYYY-MM-DD)' },
    ],
  },

  endpoint: { method: 'GET', path: '/users/{userId}/meetings' },

  fieldMappings: {
    userId: 'path',
    type: 'query',
    page_size: 'query',
    next_page_token: 'query',
    from: 'query',
    to: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(meetingsListCommand, input, client),
};
