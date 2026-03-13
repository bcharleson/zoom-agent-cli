import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const meetingsUpdateCommand: CommandDefinition = {
  name: 'meetings_update',
  group: 'meetings',
  subcommand: 'update',
  description: 'Update an existing meeting. Only include fields you want to change.',
  examples: [
    'zoom meetings update 12345678901 --topic "Updated Topic"',
    'zoom meetings update 12345678901 --duration 60 --start-time "2026-03-20T14:00:00Z"',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID'),
    topic: z.string().optional().describe('Meeting topic'),
    type: z.coerce.number().optional().describe('Meeting type'),
    start_time: z.string().optional().describe('Start time (ISO 8601)'),
    duration: z.coerce.number().optional().describe('Duration in minutes'),
    timezone: z.string().optional().describe('Timezone'),
    password: z.string().optional().describe('Meeting password'),
    agenda: z.string().optional().describe('Meeting agenda'),
    settings: z.any().optional()
      .describe('Meeting settings (JSON object)'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'topic', flags: '--topic <topic>', description: 'Meeting topic' },
      { field: 'type', flags: '-t, --type <type>', description: 'Meeting type' },
      { field: 'start_time', flags: '--start-time <time>', description: 'ISO 8601 start time' },
      { field: 'duration', flags: '-d, --duration <minutes>', description: 'Duration in minutes' },
      { field: 'timezone', flags: '--timezone <tz>', description: 'Timezone' },
      { field: 'password', flags: '-p, --password <password>', description: 'Meeting password' },
      { field: 'agenda', flags: '--agenda <text>', description: 'Meeting agenda' },
      { field: 'settings', flags: '--settings <json>', description: 'Meeting settings (JSON)' },
    ],
  },

  endpoint: { method: 'PATCH', path: '/meetings/{meetingId}' },

  fieldMappings: {
    meetingId: 'path',
    topic: 'body',
    type: 'body',
    start_time: 'body',
    duration: 'body',
    timezone: 'body',
    password: 'body',
    agenda: 'body',
    settings: 'body',
  },

  handler: async (input, client) => {
    const { meetingId, ...body } = input;
    const result = await client.patch(`/meetings/${encodeURIComponent(meetingId)}`, body);
    return result ?? { success: true, meetingId };
  },
};
