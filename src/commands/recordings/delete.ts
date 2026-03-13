import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const recordingsDeleteCommand: CommandDefinition = {
  name: 'recordings_delete',
  group: 'recordings',
  subcommand: 'delete',
  description: 'Delete all recording files for a meeting. Moves to trash by default.',
  examples: [
    'zoom recordings delete 12345678901',
    'zoom recordings delete 12345678901 --action trash',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
    action: z.enum(['trash', 'delete']).optional()
      .describe('"trash" (default, recoverable) or "delete" (permanent)'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'action', flags: '--action <action>', description: 'trash (default) or delete (permanent)' },
    ],
  },

  endpoint: { method: 'DELETE', path: '/meetings/{meetingId}/recordings' },
  fieldMappings: {
    meetingId: 'path',
    action: 'query',
  },

  handler: async (input, client) => {
    await client.delete(`/meetings/${encodeURIComponent(input.meetingId)}/recordings`, {
      action: input.action,
    });
    return { success: true, deleted: input.meetingId };
  },
};
