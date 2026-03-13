import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const chatListMessagesCommand: CommandDefinition = {
  name: 'chat_list_messages',
  group: 'chat',
  subcommand: 'list-messages',
  description: "List chat messages for a user or in a specific channel/contact.",
  examples: [
    'zoom chat list-messages --user-id me --to-channel channel-id',
    'zoom chat list-messages --user-id me --to-contact user@example.com --from 2026-03-01',
  ],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email'),
    to_channel: z.string().optional().describe('Channel ID to list messages from'),
    to_contact: z.string().optional().describe('Contact email/ID to list messages from'),
    from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    page_size: z.coerce.number().min(1).max(50).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
    include_deleted_and_edited_message: z.boolean().optional().describe('Include deleted/edited messages'),
    search_type: z.enum(['message', 'file']).optional().describe('Search type'),
    search_key: z.string().optional().describe('Search keyword'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email' },
      { field: 'to_channel', flags: '--to-channel <id>', description: 'Channel ID' },
      { field: 'to_contact', flags: '--to-contact <id>', description: 'Contact email/ID' },
      { field: 'from', flags: '--from <date>', description: 'Start date' },
      { field: 'to', flags: '--to <date>', description: 'End date' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'include_deleted_and_edited_message', flags: '--include-deleted', description: 'Include deleted/edited' },
      { field: 'search_type', flags: '--search-type <type>', description: 'message|file' },
      { field: 'search_key', flags: '--search-key <keyword>', description: 'Search keyword' },
    ],
  },

  endpoint: { method: 'GET', path: '/chat/users/{userId}/messages' },
  fieldMappings: {
    userId: 'path', to_channel: 'query', to_contact: 'query', from: 'query', to: 'query',
    page_size: 'query', next_page_token: 'query', include_deleted_and_edited_message: 'query',
    search_type: 'query', search_key: 'query',
  },
  paginated: true,
  handler: (input, client) => executeCommand(chatListMessagesCommand, input, client),
};
