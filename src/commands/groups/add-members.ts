import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const groupsAddMembersCommand: CommandDefinition = {
  name: 'groups_add_members',
  group: 'groups',
  subcommand: 'add-members',
  description: 'Add members to a group.',
  examples: ['zoom groups add-members group-id --members \'[{"email":"user@example.com"}]\''],
  inputSchema: z.object({
    groupId: z.string().describe('Group ID'),
    members: z.preprocess(
      (v) => (typeof v === 'string' ? JSON.parse(v) : v),
      z.array(z.object({ email: z.string().optional(), id: z.string().optional() })),
    ).describe('Members array [{email} or {id}]'),
  }),
  cliMappings: {
    args: [{ field: 'groupId', name: 'groupId', required: true }],
    options: [{ field: 'members', flags: '--members <json>', description: 'Members JSON array' }],
  },
  endpoint: { method: 'POST', path: '/groups/{groupId}/members' },
  fieldMappings: { groupId: 'path', members: 'body' },
  handler: async (input, client) => {
    return client.post(`/groups/${encodeURIComponent(input.groupId)}/members`, { members: input.members });
  },
};
