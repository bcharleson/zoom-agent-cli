import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const recordingsRecoverCommand: CommandDefinition = {
  name: 'recordings_recover',
  group: 'recordings',
  subcommand: 'recover',
  description: 'Recover recording files from trash.',
  examples: [
    'zoom recordings recover 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting UUID (double-encode if contains / or //)'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  endpoint: { method: 'PUT', path: '/meetings/{meetingId}/recordings/status' },
  fieldMappings: { meetingId: 'path' },

  handler: async (input, client) => {
    await client.put(
      `/meetings/${encodeURIComponent(input.meetingId)}/recordings/status`,
      { action: 'recover' },
    );
    return { success: true, recovered: input.meetingId };
  },
};
