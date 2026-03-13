import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const groupsCreateCommand: CommandDefinition = {
  name: 'groups_create',
  group: 'groups',
  subcommand: 'create',
  description: 'Create a new group.',
  examples: ['zoom groups create --name "Engineering Team"'],
  inputSchema: z.object({ name: z.string().describe('Group name') }),
  cliMappings: { options: [{ field: 'name', flags: '-n, --name <name>', description: 'Group name (required)' }] },
  endpoint: { method: 'POST', path: '/groups' },
  fieldMappings: { name: 'body' },
  handler: async (input, client) => client.post('/groups', { name: input.name }),
};
