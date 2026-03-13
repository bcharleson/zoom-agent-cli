import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const usersCreateCommand: CommandDefinition = {
  name: 'users_create',
  group: 'users',
  subcommand: 'create',
  description: 'Create a new user on the account.',
  examples: [
    'zoom users create --email user@example.com --first-name John --last-name Doe --type 1',
  ],

  inputSchema: z.object({
    action: z.enum(['create', 'autoCreate', 'custCreate', 'ssoCreate']).default('create')
      .describe('Create action type'),
    email: z.string().describe('User email'),
    first_name: z.string().optional().describe('First name'),
    last_name: z.string().optional().describe('Last name'),
    type: z.coerce.number().default(1)
      .describe('User type: 1=Basic, 2=Licensed, 3=On-prem, 99=None'),
  }),

  cliMappings: {
    options: [
      { field: 'action', flags: '--action <action>', description: 'create|autoCreate|custCreate|ssoCreate' },
      { field: 'email', flags: '-e, --email <email>', description: 'User email (required)' },
      { field: 'first_name', flags: '--first-name <name>', description: 'First name' },
      { field: 'last_name', flags: '--last-name <name>', description: 'Last name' },
      { field: 'type', flags: '-t, --type <type>', description: '1=Basic, 2=Licensed, 3=On-prem' },
    ],
  },

  endpoint: { method: 'POST', path: '/users' },

  fieldMappings: {
    action: 'body',
    email: 'body',
    first_name: 'body',
    last_name: 'body',
    type: 'body',
  },

  handler: async (input, client) => {
    return client.post('/users', {
      action: input.action,
      user_info: {
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        type: input.type,
      },
    });
  },
};
