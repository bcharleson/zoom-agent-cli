import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const recordingsTranscriptCommand: CommandDefinition = {
  name: 'recordings_transcript',
  group: 'recordings',
  subcommand: 'transcript',
  description: 'Get the transcript for a meeting recording. Returns VTT-format transcript content.',
  examples: [
    'zoom recordings transcript 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  endpoint: { method: 'GET', path: '/meetings/{meetingId}/recordings/transcript' },
  fieldMappings: { meetingId: 'path' },

  handler: (input, client) => executeCommand(recordingsTranscriptCommand, input, client),
};
