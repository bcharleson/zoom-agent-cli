import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const recordingsDeleteFileCommand: CommandDefinition = {
  name: 'recordings_delete_file',
  group: 'recordings',
  subcommand: 'delete-file',
  description: 'Delete a specific recording file from a meeting.',
  examples: [
    'zoom recordings delete-file 12345678901 abc-recording-file-id',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
    recordingId: z.string().describe('Recording file ID'),
    action: z.enum(['trash', 'delete']).optional()
      .describe('"trash" (default) or "delete" (permanent)'),
  }),

  cliMappings: {
    args: [
      { field: 'meetingId', name: 'meetingId', required: true },
      { field: 'recordingId', name: 'recordingId', required: true },
    ],
    options: [
      { field: 'action', flags: '--action <action>', description: 'trash or delete' },
    ],
  },

  endpoint: { method: 'DELETE', path: '/meetings/{meetingId}/recordings/{recordingId}' },
  fieldMappings: {
    meetingId: 'path',
    recordingId: 'path',
    action: 'query',
  },

  handler: async (input, client) => {
    await client.delete(
      `/meetings/${encodeURIComponent(input.meetingId)}/recordings/${encodeURIComponent(input.recordingId)}`,
      { action: input.action },
    );
    return { success: true, deleted: input.recordingId };
  },
};
