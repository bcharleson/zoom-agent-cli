import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const groupsListCommand: CommandDefinition = {
  name: 'groups_list',
  group: 'groups',
  subcommand: 'list',
  description: 'List all groups on the account.',
  examples: ['zoom groups list'],
  inputSchema: z.object({}),
  cliMappings: {},
  endpoint: { method: 'GET', path: '/groups' },
  fieldMappings: {},
  handler: (input, client) => executeCommand(groupsListCommand, input, client),
};
