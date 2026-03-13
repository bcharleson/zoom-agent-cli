import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const webinarsAddRegistrantCommand: CommandDefinition = {
  name: 'webinars_add_registrant',
  group: 'webinars',
  subcommand: 'add-registrant',
  description: 'Add a registrant to a webinar.',
  examples: ['zoom webinars add-registrant 12345678901 --email user@example.com --first-name John'],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
    email: z.string().describe('Registrant email'),
    first_name: z.string().describe('First name'),
    last_name: z.string().optional().describe('Last name'),
    org: z.string().optional().describe('Organization'),
    job_title: z.string().optional().describe('Job title'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
    options: [
      { field: 'email', flags: '-e, --email <email>', description: 'Email (required)' },
      { field: 'first_name', flags: '--first-name <name>', description: 'First name (required)' },
      { field: 'last_name', flags: '--last-name <name>', description: 'Last name' },
      { field: 'org', flags: '--org <org>', description: 'Organization' },
      { field: 'job_title', flags: '--job-title <title>', description: 'Job title' },
    ],
  },

  endpoint: { method: 'POST', path: '/webinars/{webinarId}/registrants' },
  fieldMappings: { webinarId: 'path', email: 'body', first_name: 'body', last_name: 'body', org: 'body', job_title: 'body' },

  handler: async (input, client) => {
    const { webinarId, ...body } = input;
    return client.post(`/webinars/${encodeURIComponent(webinarId)}/registrants`, body);
  },
};
