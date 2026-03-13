import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const usersGetCommand: CommandDefinition = {
  name: 'users_get',
  group: 'users',
  subcommand: 'get',
  description: 'Get user details by ID or email. Use "me" for the authenticated user.',
  examples: [
    'zoom users get me',
    'zoom users get user@example.com',
  ],

  inputSchema: z.object({
    userId: z.string().describe('User ID, email, or "me"'),
  }),

  cliMappings: {
    args: [{ field: 'userId', name: 'userId', required: true }],
  },

  endpoint: { method: 'GET', path: '/users/{userId}' },
  fieldMappings: { userId: 'path' },

  handler: (input, client) => executeCommand(usersGetCommand, input, client),
};
