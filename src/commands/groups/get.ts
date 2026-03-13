import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const groupsGetCommand: CommandDefinition = {
  name: 'groups_get',
  group: 'groups',
  subcommand: 'get',
  description: 'Get a group by ID.',
  examples: ['zoom groups get group-id-here'],
  inputSchema: z.object({ groupId: z.string().describe('Group ID') }),
  cliMappings: { args: [{ field: 'groupId', name: 'groupId', required: true }] },
  endpoint: { method: 'GET', path: '/groups/{groupId}' },
  fieldMappings: { groupId: 'path' },
  handler: (input, client) => executeCommand(groupsGetCommand, input, client),
};
