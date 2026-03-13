import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const chatSendMessageCommand: CommandDefinition = {
  name: 'chat_send_message',
  group: 'chat',
  subcommand: 'send-message',
  description: 'Send a chat message to a channel or contact.',
  examples: [
    'zoom chat send-message --user-id me --to-channel channel-id --message "Hello team!"',
    'zoom chat send-message --user-id me --to-contact user@example.com --message "Hey!"',
  ],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email'),
    message: z.string().describe('Message content'),
    to_channel: z.string().optional().describe('Send to channel ID'),
    to_contact: z.string().optional().describe('Send to contact email/ID'),
    reply_main_message_id: z.string().optional().describe('Reply to a specific message ID'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email' },
      { field: 'message', flags: '-m, --message <text>', description: 'Message content (required)' },
      { field: 'to_channel', flags: '--to-channel <id>', description: 'Channel ID' },
      { field: 'to_contact', flags: '--to-contact <id>', description: 'Contact email/ID' },
      { field: 'reply_main_message_id', flags: '--reply-to <id>', description: 'Reply to message ID' },
    ],
  },

  endpoint: { method: 'POST', path: '/chat/users/{userId}/messages' },
  fieldMappings: {
    userId: 'path', message: 'body', to_channel: 'body', to_contact: 'body',
    reply_main_message_id: 'body',
  },

  handler: async (input, client) => {
    const { userId, ...body } = input;
    return client.post(`/chat/users/${encodeURIComponent(userId)}/messages`, body);
  },
};
