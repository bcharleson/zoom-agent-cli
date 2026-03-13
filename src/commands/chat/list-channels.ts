import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const chatListChannelsCommand: CommandDefinition = {
  name: 'chat_list_channels',
  group: 'chat',
  subcommand: 'list-channels',
  description: "List a user's chat channels.",
  examples: ['zoom chat list-channels --user-id me'],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email'),
    page_size: z.coerce.number().min(1).max(50).optional().describe('Results per page (max 50)'),
    next_page_token: z.string().optional().describe('Pagination token'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },

  endpoint: { method: 'GET', path: '/chat/users/{userId}/channels' },
  fieldMappings: { userId: 'path', page_size: 'query', next_page_token: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(chatListChannelsCommand, input, client),
};
