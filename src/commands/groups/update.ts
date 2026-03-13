import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const groupsUpdateCommand: CommandDefinition = {
  name: 'groups_update',
  group: 'groups',
  subcommand: 'update',
  description: 'Update a group name.',
  examples: ['zoom groups update group-id --name "New Name"'],
  inputSchema: z.object({
    groupId: z.string().describe('Group ID'),
    name: z.string().describe('New group name'),
  }),
  cliMappings: {
    args: [{ field: 'groupId', name: 'groupId', required: true }],
    options: [{ field: 'name', flags: '-n, --name <name>', description: 'New group name (required)' }],
  },
  endpoint: { method: 'PATCH', path: '/groups/{groupId}' },
  fieldMappings: { groupId: 'path', name: 'body' },
  handler: async (input, client) => {
    const result = await client.patch(`/groups/${encodeURIComponent(input.groupId)}`, { name: input.name });
    return result ?? { success: true, groupId: input.groupId };
  },
};
