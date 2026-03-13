import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const pastMeetingsParticipantsCommand: CommandDefinition = {
  name: 'past_meetings_participants',
  group: 'past-meetings',
  subcommand: 'participants',
  description: 'Get participants of a past meeting instance with join/leave times and duration.',
  examples: [
    'zoom past-meetings participants "meeting-uuid-here"',
    'zoom past-meetings participants "meeting-uuid-here" --page-size 50',
  ],

  inputSchema: z.object({
    meetingUUID: z.string().describe('Meeting UUID'),
    page_size: z.coerce.number().min(1).max(300).optional()
      .describe('Results per page'),
    next_page_token: z.string().optional()
      .describe('Pagination token'),
  }),

  cliMappings: {
    args: [{ field: 'meetingUUID', name: 'meetingUUID', required: true }],
    options: [
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
    ],
  },

  endpoint: { method: 'GET', path: '/past_meetings/{meetingUUID}/participants' },
  fieldMappings: {
    meetingUUID: 'path',
    page_size: 'query',
    next_page_token: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(pastMeetingsParticipantsCommand, input, client),
};
