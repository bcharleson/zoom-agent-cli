import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const groupsDeleteCommand: CommandDefinition = {
  name: 'groups_delete',
  group: 'groups',
  subcommand: 'delete',
  description: 'Delete a group.',
  examples: ['zoom groups delete group-id-here'],
  inputSchema: z.object({ groupId: z.string().describe('Group ID') }),
  cliMappings: { args: [{ field: 'groupId', name: 'groupId', required: true }] },
  endpoint: { method: 'DELETE', path: '/groups/{groupId}' },
  fieldMappings: { groupId: 'path' },
  handler: async (input, client) => {
    await client.delete(`/groups/${encodeURIComponent(input.groupId)}`);
    return { success: true, deleted: input.groupId };
  },
};
