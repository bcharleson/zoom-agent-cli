import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const groupsListMembersCommand: CommandDefinition = {
  name: 'groups_list_members',
  group: 'groups',
  subcommand: 'list-members',
  description: 'List members of a group.',
  examples: ['zoom groups list-members group-id-here'],
  inputSchema: z.object({
    groupId: z.string().describe('Group ID'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
  }),
  cliMappings: {
    args: [{ field: 'groupId', name: 'groupId', required: true }],
    options: [
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },
  endpoint: { method: 'GET', path: '/groups/{groupId}/members' },
  fieldMappings: { groupId: 'path', page_size: 'query', next_page_token: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(groupsListMembersCommand, input, client),
};
