import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const chatCreateChannelCommand: CommandDefinition = {
  name: 'chat_create_channel',
  group: 'chat',
  subcommand: 'create-channel',
  description: 'Create a new chat channel.',
  examples: ['zoom chat create-channel --user-id me --name "Project Alpha" --type 1'],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email'),
    name: z.string().describe('Channel name'),
    type: z.coerce.number().optional().describe('1=Public, 2=Private, 3=Shared, 4=New chat'),
    members: z.preprocess(
      (v) => (typeof v === 'string' ? JSON.parse(v) : v),
      z.array(z.object({ email: z.string() })).optional(),
    ).describe('Channel members [{email}]'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email' },
      { field: 'name', flags: '-n, --name <name>', description: 'Channel name (required)' },
      { field: 'type', flags: '-t, --type <type>', description: '1=Public, 2=Private, 3=Shared' },
      { field: 'members', flags: '--members <json>', description: 'Members JSON array [{email}]' },
    ],
  },

  endpoint: { method: 'POST', path: '/chat/users/{userId}/channels' },
  fieldMappings: { userId: 'path', name: 'body', type: 'body', members: 'body' },

  handler: async (input, client) => {
    const { userId, ...body } = input;
    return client.post(`/chat/users/${encodeURIComponent(userId)}/channels`, body);
  },
};
