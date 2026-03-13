import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const webinarsUpdateCommand: CommandDefinition = {
  name: 'webinars_update',
  group: 'webinars',
  subcommand: 'update',
  description: 'Update a webinar.',
  examples: ['zoom webinars update 12345678901 --topic "Updated Topic"'],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
    topic: z.string().optional().describe('Webinar topic'),
    type: z.coerce.number().optional().describe('Webinar type'),
    start_time: z.string().optional().describe('Start time (ISO 8601)'),
    duration: z.coerce.number().optional().describe('Duration in minutes'),
    timezone: z.string().optional().describe('Timezone'),
    password: z.string().optional().describe('Webinar password'),
    agenda: z.string().optional().describe('Webinar description'),
    settings: z.any().optional()
      .describe('Webinar settings (JSON object)'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
    options: [
      { field: 'topic', flags: '--topic <topic>', description: 'Webinar topic' },
      { field: 'type', flags: '-t, --type <type>', description: 'Webinar type' },
      { field: 'start_time', flags: '--start-time <time>', description: 'ISO 8601 start time' },
      { field: 'duration', flags: '-d, --duration <minutes>', description: 'Duration' },
      { field: 'timezone', flags: '--timezone <tz>', description: 'Timezone' },
      { field: 'password', flags: '-p, --password <password>', description: 'Password' },
      { field: 'agenda', flags: '--agenda <text>', description: 'Description' },
      { field: 'settings', flags: '--settings <json>', description: 'Settings (JSON)' },
    ],
  },

  endpoint: { method: 'PATCH', path: '/webinars/{webinarId}' },
  fieldMappings: {
    webinarId: 'path', topic: 'body', type: 'body', start_time: 'body',
    duration: 'body', timezone: 'body', password: 'body', agenda: 'body', settings: 'body',
  },

  handler: async (input, client) => {
    const { webinarId, ...body } = input;
    const result = await client.patch(`/webinars/${encodeURIComponent(webinarId)}`, body);
    return result ?? { success: true, webinarId };
  },
};
