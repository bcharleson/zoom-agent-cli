import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const reportsMeetingParticipantsCommand: CommandDefinition = {
  name: 'reports_meeting_participants',
  group: 'reports',
  subcommand: 'meeting-participants',
  description: 'Get participant report for a past meeting with join/leave times and duration.',
  examples: ['zoom reports meeting-participants 12345678901'],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
    include_fields: z.string().optional().describe('Additional fields (e.g., "registrant_id")'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'include_fields', flags: '--include-fields <fields>', description: 'Additional fields' },
    ],
  },

  endpoint: { method: 'GET', path: '/report/meetings/{meetingId}/participants' },
  fieldMappings: { meetingId: 'path', page_size: 'query', next_page_token: 'query', include_fields: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(reportsMeetingParticipantsCommand, input, client),
};
