import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const meetingsDeleteCommand: CommandDefinition = {
  name: 'meetings_delete',
  group: 'meetings',
  subcommand: 'delete',
  description: 'Delete a meeting. For recurring meetings, use --occurrence-id to delete a specific occurrence.',
  examples: [
    'zoom meetings delete 12345678901',
    'zoom meetings delete 12345678901 --schedule-for-reminder true',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID'),
    occurrence_id: z.string().optional().describe('Occurrence ID for recurring meetings'),
    schedule_for_reminder: z.boolean().optional().describe('Send cancellation email to registrants'),
    cancel_meeting_reminder: z.boolean().optional().describe('Send cancellation email to host/alt hosts'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'occurrence_id', flags: '--occurrence-id <id>', description: 'Occurrence ID for recurring meetings' },
      { field: 'schedule_for_reminder', flags: '--schedule-for-reminder', description: 'Email registrants about cancellation' },
      { field: 'cancel_meeting_reminder', flags: '--cancel-meeting-reminder', description: 'Email host about cancellation' },
    ],
  },

  endpoint: { method: 'DELETE', path: '/meetings/{meetingId}' },

  fieldMappings: {
    meetingId: 'path',
    occurrence_id: 'query',
    schedule_for_reminder: 'query',
    cancel_meeting_reminder: 'query',
  },

  handler: async (input, client) => {
    await executeCommand(meetingsDeleteCommand, input, client);
    return { success: true, deleted: input.meetingId };
  },
};
