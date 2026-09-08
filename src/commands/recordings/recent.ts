import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { listRecordingsRange, summarizeRecording } from './shared.js';

export const recordingsRecentCommand: CommandDefinition = {
  name: 'recordings_recent',
  group: 'recordings',
  subcommand: 'recent',
  description:
    'List cloud recordings from the last N days (default 14, max 90) with has_transcript. Use this to find meetings, then recordings transcript <id>.',
  examples: [
    'zoom recordings recent',
    'zoom recordings recent --days 30 --pretty',
  ],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email (default me)'),
    days: z.coerce.number().min(1).max(90).default(14).describe('How many days back to search'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email (default: me)' },
      { field: 'days', flags: '-d, --days <n>', description: 'Days to include (default 14, max 90)' },
    ],
  },

  endpoint: { method: 'GET', path: '/users/{userId}/recordings' },
  fieldMappings: { userId: 'path' },

  handler: async (input, client) => {
    const days = Number(input.days ?? 14);
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400000);
    const meetings = await listRecordingsRange(client, String(input.userId ?? 'me'), from, to);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      total: meetings.length,
      with_transcript: meetings.filter((m) => summarizeRecording(m).has_transcript).length,
      items: meetings.map(summarizeRecording),
    };
  },
};
