import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const meetingsEndCommand: CommandDefinition = {
  name: 'meetings_end',
  group: 'meetings',
  subcommand: 'end',
  description: 'End a live meeting. Sets the meeting status to "end".',
  examples: [
    'zoom meetings end 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  endpoint: { method: 'PUT', path: '/meetings/{meetingId}/status' },

  fieldMappings: {
    meetingId: 'path',
  },

  handler: async (input, client) => {
    await client.put(`/meetings/${encodeURIComponent(input.meetingId)}/status`, {
      action: 'end',
    });
    return { success: true, ended: input.meetingId };
  },
};
