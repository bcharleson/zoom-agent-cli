import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const webinarsCreateCommand: CommandDefinition = {
  name: 'webinars_create',
  group: 'webinars',
  subcommand: 'create',
  description: 'Create a new webinar for a user.',
  examples: [
    'zoom webinars create --topic "Product Launch" --type 5 --start-time "2026-04-01T14:00:00Z" --duration 90',
  ],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email'),
    topic: z.string().describe('Webinar topic'),
    type: z.coerce.number().optional().describe('5=Webinar, 6=Recurring no fixed time, 9=Recurring fixed time'),
    start_time: z.string().optional().describe('Start time (ISO 8601)'),
    duration: z.coerce.number().optional().describe('Duration in minutes'),
    timezone: z.string().optional().describe('Timezone'),
    password: z.string().optional().describe('Webinar password'),
    agenda: z.string().optional().describe('Webinar description'),
    settings: z.any().optional()
      .describe('Webinar settings (JSON object)'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email' },
      { field: 'topic', flags: '--topic <topic>', description: 'Webinar topic (required)' },
      { field: 'type', flags: '-t, --type <type>', description: '5=Webinar, 6=Recurring, 9=Recurring fixed' },
      { field: 'start_time', flags: '--start-time <time>', description: 'ISO 8601 start time' },
      { field: 'duration', flags: '-d, --duration <minutes>', description: 'Duration in minutes' },
      { field: 'timezone', flags: '--timezone <tz>', description: 'Timezone' },
      { field: 'password', flags: '-p, --password <password>', description: 'Webinar password' },
      { field: 'agenda', flags: '--agenda <text>', description: 'Webinar description' },
      { field: 'settings', flags: '--settings <json>', description: 'Webinar settings (JSON)' },
    ],
  },

  endpoint: { method: 'POST', path: '/users/{userId}/webinars' },
  fieldMappings: {
    userId: 'path', topic: 'body', type: 'body', start_time: 'body',
    duration: 'body', timezone: 'body', password: 'body', agenda: 'body', settings: 'body',
  },

  handler: async (input, client) => {
    const { userId, ...body } = input;
    return client.post(`/users/${encodeURIComponent(userId)}/webinars`, body);
  },
};
