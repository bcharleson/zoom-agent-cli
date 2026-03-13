import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const usersUpdateCommand: CommandDefinition = {
  name: 'users_update',
  group: 'users',
  subcommand: 'update',
  description: 'Update a user profile. Only include fields you want to change.',
  examples: [
    'zoom users update user@example.com --first-name Jane',
    'zoom users update me --timezone "America/New_York"',
  ],

  inputSchema: z.object({
    userId: z.string().describe('User ID or email'),
    first_name: z.string().optional().describe('First name'),
    last_name: z.string().optional().describe('Last name'),
    type: z.coerce.number().optional().describe('User type'),
    timezone: z.string().optional().describe('Timezone'),
    dept: z.string().optional().describe('Department'),
    company: z.string().optional().describe('Company'),
    language: z.string().optional().describe('Language'),
    phone_number: z.string().optional().describe('Phone number'),
    job_title: z.string().optional().describe('Job title'),
    pmi: z.coerce.number().optional().describe('Personal Meeting ID'),
  }),

  cliMappings: {
    args: [{ field: 'userId', name: 'userId', required: true }],
    options: [
      { field: 'first_name', flags: '--first-name <name>', description: 'First name' },
      { field: 'last_name', flags: '--last-name <name>', description: 'Last name' },
      { field: 'type', flags: '-t, --type <type>', description: 'User type' },
      { field: 'timezone', flags: '--timezone <tz>', description: 'Timezone' },
      { field: 'dept', flags: '--dept <dept>', description: 'Department' },
      { field: 'company', flags: '--company <company>', description: 'Company' },
      { field: 'language', flags: '--language <lang>', description: 'Language' },
      { field: 'phone_number', flags: '--phone <number>', description: 'Phone number' },
      { field: 'job_title', flags: '--job-title <title>', description: 'Job title' },
      { field: 'pmi', flags: '--pmi <number>', description: 'Personal Meeting ID' },
    ],
  },

  endpoint: { method: 'PATCH', path: '/users/{userId}' },

  fieldMappings: {
    userId: 'path',
    first_name: 'body',
    last_name: 'body',
    type: 'body',
    timezone: 'body',
    dept: 'body',
    company: 'body',
    language: 'body',
    phone_number: 'body',
    job_title: 'body',
    pmi: 'body',
  },

  handler: async (input, client) => {
    const { userId, ...body } = input;
    const result = await client.patch(`/users/${encodeURIComponent(userId)}`, body);
    return result ?? { success: true, userId };
  },
};
