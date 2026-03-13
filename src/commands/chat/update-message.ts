import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const chatUpdateMessageCommand: CommandDefinition = {
  name: 'chat_update_message',
  group: 'chat',
  subcommand: 'update-message',
  description: 'Update a chat message.',
  examples: ['zoom chat update-message msg-id-here --message "Updated message"'],

  inputSchema: z.object({
    messageId: z.string().describe('Message ID'),
    message: z.string().describe('Updated message content'),
    to_channel: z.string().optional().describe('Channel ID (if channel message)'),
    to_contact: z.string().optional().describe('Contact email/ID (if DM)'),
  }),

  cliMappings: {
    args: [{ field: 'messageId', name: 'messageId', required: true }],
    options: [
      { field: 'message', flags: '-m, --message <text>', description: 'Updated content (required)' },
      { field: 'to_channel', flags: '--to-channel <id>', description: 'Channel ID' },
      { field: 'to_contact', flags: '--to-contact <id>', description: 'Contact email/ID' },
    ],
  },

  endpoint: { method: 'PUT', path: '/chat/users/me/messages/{messageId}' },
  fieldMappings: { messageId: 'path', message: 'body', to_channel: 'body', to_contact: 'body' },

  handler: async (input, client) => {
    const { messageId, ...body } = input;
    const result = await client.put(`/chat/users/me/messages/${encodeURIComponent(messageId)}`, body);
    return result ?? { success: true, messageId };
  },
};
