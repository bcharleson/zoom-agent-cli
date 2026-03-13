import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const chatListMembersCommand: CommandDefinition = {
  name: 'chat_list_members',
  group: 'chat',
  subcommand: 'list-members',
  description: 'List members of a chat channel.',
  examples: ['zoom chat list-members channel-id-here'],

  inputSchema: z.object({
    channelId: z.string().describe('Channel ID'),
    page_size: z.coerce.number().min(1).max(50).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
  }),

  cliMappings: {
    args: [{ field: 'channelId', name: 'channelId', required: true }],
    options: [
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },

  endpoint: { method: 'GET', path: '/chat/channels/{channelId}/members' },
  fieldMappings: { channelId: 'path', page_size: 'query', next_page_token: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(chatListMembersCommand, input, client),
};
