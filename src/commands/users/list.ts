import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const usersListCommand: CommandDefinition = {
  name: 'users_list',
  group: 'users',
  subcommand: 'list',
  description: 'List all users on the account. Returns user details including email, type, and status.',
  examples: [
    'zoom users list',
    'zoom users list --status active --page-size 50',
  ],

  inputSchema: z.object({
    status: z.enum(['active', 'inactive', 'pending']).optional()
      .describe('Filter by user status'),
    page_size: z.coerce.number().min(1).max(300).optional()
      .describe('Results per page'),
    next_page_token: z.string().optional()
      .describe('Pagination token'),
    role_id: z.string().optional()
      .describe('Filter by role ID'),
    include_fields: z.string().optional()
      .describe('Additional fields (e.g., "host_key,custom_attributes")'),
  }),

  cliMappings: {
    options: [
      { field: 'status', flags: '-s, --status <status>', description: 'active|inactive|pending' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'role_id', flags: '--role-id <id>', description: 'Filter by role' },
      { field: 'include_fields', flags: '--include-fields <fields>', description: 'Additional fields' },
    ],
  },

  endpoint: { method: 'GET', path: '/users' },

  fieldMappings: {
    status: 'query',
    page_size: 'query',
    next_page_token: 'query',
    role_id: 'query',
    include_fields: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(usersListCommand, input, client),
};
