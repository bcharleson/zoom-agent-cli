import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const chatGetChannelCommand: CommandDefinition = {
  name: 'chat_get_channel',
  group: 'chat',
  subcommand: 'get-channel',
  description: 'Get details of a chat channel.',
  examples: ['zoom chat get-channel channel-id-here'],

  inputSchema: z.object({
    channelId: z.string().describe('Channel ID'),
  }),

  cliMappings: {
    args: [{ field: 'channelId', name: 'channelId', required: true }],
  },

  endpoint: { method: 'GET', path: '/chat/channels/{channelId}' },
  fieldMappings: { channelId: 'path' },
  handler: (input, client) => executeCommand(chatGetChannelCommand, input, client),
};
