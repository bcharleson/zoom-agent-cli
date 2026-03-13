import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const meetingsSummaryCommand: CommandDefinition = {
  name: 'meetings_summary',
  group: 'meetings',
  subcommand: 'summary',
  description: 'Get the AI Companion meeting summary. Requires AI Companion to be enabled. Use the post-meeting UUID, not the scheduled meeting ID.',
  examples: [
    'zoom meetings summary 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID (use double-encoded UUID if it contains / or //)'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  endpoint: { method: 'GET', path: '/meetings/{meetingId}/meeting_summary' },
  fieldMappings: { meetingId: 'path' },

  handler: (input, client) => executeCommand(meetingsSummaryCommand, input, client),
};
