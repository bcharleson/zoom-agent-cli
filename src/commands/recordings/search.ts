import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { listRecordingsRange, summarizeRecording } from './shared.js';

export const recordingsSearchCommand: CommandDefinition = {
  name: 'recordings_search',
  group: 'recordings',
  subcommand: 'search',
  description:
    'Search cloud recording topics by keyword (client-side). Default lookback 90 days. Then pull VTT with recordings transcript <id>.',
  examples: [
    'zoom recordings search Matchr',
    'zoom recordings search JC --days 30 --pretty',
  ],

  inputSchema: z.object({
    keyword: z.string().describe('Case-insensitive topic keyword'),
    userId: z.string().default('me').describe('User ID or email (default me)'),
    days: z.coerce.number().min(1).max(90).default(90).describe('Days to scan (default 90)'),
  }),

  cliMappings: {
    args: [{ field: 'keyword', name: 'keyword', required: true }],
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email (default: me)' },
      { field: 'days', flags: '-d, --days <n>', description: 'Days to scan (default 90, max 90)' },
    ],
  },

  endpoint: { method: 'GET', path: '/users/{userId}/recordings' },
  fieldMappings: { userId: 'path' },

  handler: async (input, client) => {
    const keyword = String(input.keyword ?? '').trim();
    const days = Number(input.days ?? 90);
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400000);
    const meetings = await listRecordingsRange(client, String(input.userId ?? 'me'), from, to);
    const needle = keyword.toLowerCase();
    const items = meetings
      .map(summarizeRecording)
      .filter((m) => (m.topic || '').toLowerCase().includes(needle));
    return { keyword, from: from.toISOString(), to: to.toISOString(), total: items.length, items };
  },
};
