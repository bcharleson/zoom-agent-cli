import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const meetingsAddRegistrantCommand: CommandDefinition = {
  name: 'meetings_add_registrant',
  group: 'meetings',
  subcommand: 'add-registrant',
  description: 'Add a registrant to a meeting that has registration enabled.',
  examples: [
    'zoom meetings add-registrant 12345678901 --email user@example.com --first-name John --last-name Doe',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID'),
    email: z.string().describe('Registrant email'),
    first_name: z.string().describe('First name'),
    last_name: z.string().optional().describe('Last name'),
    auto_approve: z.boolean().optional().describe('Auto-approve registrant'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'email', flags: '-e, --email <email>', description: 'Registrant email (required)' },
      { field: 'first_name', flags: '--first-name <name>', description: 'First name (required)' },
      { field: 'last_name', flags: '--last-name <name>', description: 'Last name' },
      { field: 'auto_approve', flags: '--auto-approve', description: 'Auto-approve registrant' },
    ],
  },

  endpoint: { method: 'POST', path: '/meetings/{meetingId}/registrants' },

  fieldMappings: {
    meetingId: 'path',
    email: 'body',
    first_name: 'body',
    last_name: 'body',
    auto_approve: 'body',
  },

  handler: async (input, client) => {
    const { meetingId, ...body } = input;
    return client.post(`/meetings/${encodeURIComponent(meetingId)}/registrants`, body);
  },
};
