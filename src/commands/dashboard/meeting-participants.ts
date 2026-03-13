import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const dashboardMeetingParticipantsCommand: CommandDefinition = {
  name: 'dashboard_meeting_participants',
  group: 'dashboard',
  subcommand: 'meeting-participants',
  description: 'Get participant quality metrics for a meeting from the dashboard.',
  examples: ['zoom dashboard meeting-participants 12345678901'],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
    type: z.enum(['live', 'past', 'pastOne']).optional().describe('Meeting type'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
    include_fields: z.string().optional().describe('Additional fields'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'type', flags: '-t, --type <type>', description: 'live|past|pastOne' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'include_fields', flags: '--include-fields <fields>', description: 'Additional fields' },
    ],
  },

  endpoint: { method: 'GET', path: '/metrics/meetings/{meetingId}/participants' },
  fieldMappings: { meetingId: 'path', type: 'query', page_size: 'query', next_page_token: 'query', include_fields: 'query' },
  paginated: true,
  handler: (input, client) => executeCommand(dashboardMeetingParticipantsCommand, input, client),
};
