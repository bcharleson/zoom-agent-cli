import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const chatDeleteMessageCommand: CommandDefinition = {
  name: 'chat_delete_message',
  group: 'chat',
  subcommand: 'delete-message',
  description: 'Delete a chat message.',
  examples: ['zoom chat delete-message msg-id-here --to-channel channel-id'],

  inputSchema: z.object({
    messageId: z.string().describe('Message ID'),
    to_channel: z.string().optional().describe('Channel ID (if channel message)'),
    to_contact: z.string().optional().describe('Contact email/ID (if DM)'),
  }),

  cliMappings: {
    args: [{ field: 'messageId', name: 'messageId', required: true }],
    options: [
      { field: 'to_channel', flags: '--to-channel <id>', description: 'Channel ID' },
      { field: 'to_contact', flags: '--to-contact <id>', description: 'Contact email/ID' },
    ],
  },

  endpoint: { method: 'DELETE', path: '/chat/users/me/messages/{messageId}' },
  fieldMappings: { messageId: 'path', to_channel: 'query', to_contact: 'query' },

  handler: async (input, client) => {
    await client.delete(`/chat/users/me/messages/${encodeURIComponent(input.messageId)}`, {
      to_channel: input.to_channel,
      to_contact: input.to_contact,
    });
    return { success: true, deleted: input.messageId };
  },
};
