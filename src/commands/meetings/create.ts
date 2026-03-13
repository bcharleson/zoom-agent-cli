import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const meetingsCreateCommand: CommandDefinition = {
  name: 'meetings_create',
  group: 'meetings',
  subcommand: 'create',
  description: 'Create a new meeting for a user. Supports instant, scheduled, and recurring meeting types.',
  examples: [
    'zoom meetings create --topic "Team Standup" --type 2 --duration 30',
    'zoom meetings create --user-id me --topic "Client Call" --type 2 --start-time "2026-03-15T10:00:00Z" --duration 60 --timezone "America/New_York"',
    'zoom meetings create --topic "Quick Sync" --type 1',
  ],

  inputSchema: z.object({
    userId: z.string().default('me')
      .describe('User ID or email'),
    topic: z.string().describe('Meeting topic/title'),
    type: z.coerce.number().optional()
      .describe('1=Instant, 2=Scheduled, 3=Recurring no fixed time, 8=Recurring fixed time'),
    start_time: z.string().optional()
      .describe('Start time in ISO 8601 (e.g., 2026-03-15T10:00:00Z)'),
    duration: z.coerce.number().optional()
      .describe('Duration in minutes'),
    timezone: z.string().optional()
      .describe('Timezone (e.g., America/New_York)'),
    password: z.string().optional()
      .describe('Meeting password (max 10 chars)'),
    agenda: z.string().optional()
      .describe('Meeting description/agenda'),
    default_password: z.boolean().optional()
      .describe('Use default password'),
    pre_schedule: z.boolean().optional()
      .describe('Allow pre-scheduling'),
    settings: z.any().optional()
      .describe('Meeting settings as JSON object (host_video, participant_video, join_before_host, mute_upon_entry, auto_recording, waiting_room, etc.)'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email (default: "me")' },
      { field: 'topic', flags: '--topic <topic>', description: 'Meeting topic (required)' },
      { field: 'type', flags: '-t, --type <type>', description: '1=Instant, 2=Scheduled, 3=Recurring, 8=Recurring fixed' },
      { field: 'start_time', flags: '--start-time <time>', description: 'ISO 8601 start time' },
      { field: 'duration', flags: '-d, --duration <minutes>', description: 'Duration in minutes' },
      { field: 'timezone', flags: '--timezone <tz>', description: 'Timezone' },
      { field: 'password', flags: '-p, --password <password>', description: 'Meeting password' },
      { field: 'agenda', flags: '--agenda <text>', description: 'Meeting agenda/description' },
      { field: 'default_password', flags: '--default-password', description: 'Use default password' },
      { field: 'pre_schedule', flags: '--pre-schedule', description: 'Allow pre-scheduling' },
      { field: 'settings', flags: '--settings <json>', description: 'Meeting settings (JSON object)' },
    ],
  },

  endpoint: { method: 'POST', path: '/users/{userId}/meetings' },

  fieldMappings: {
    userId: 'path',
    topic: 'body',
    type: 'body',
    start_time: 'body',
    duration: 'body',
    timezone: 'body',
    password: 'body',
    agenda: 'body',
    default_password: 'body',
    pre_schedule: 'body',
    settings: 'body',
  },

  handler: async (input, client) => {
    const { userId, ...body } = input;
    return client.post(`/users/${encodeURIComponent(userId)}/meetings`, body);
  },
};
