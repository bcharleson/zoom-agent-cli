import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const pastMeetingsGetCommand: CommandDefinition = {
  name: 'past_meetings_get',
  group: 'past-meetings',
  subcommand: 'get',
  description: 'Get details of a past meeting instance. Use the meeting UUID, not the meeting ID.',
  examples: [
    'zoom past-meetings get "meeting-uuid-here"',
  ],

  inputSchema: z.object({
    meetingUUID: z.string().describe('Meeting UUID (double-encode if contains / or //)'),
  }),

  cliMappings: {
    args: [{ field: 'meetingUUID', name: 'meetingUUID', required: true }],
  },

  endpoint: { method: 'GET', path: '/past_meetings/{meetingUUID}' },
  fieldMappings: { meetingUUID: 'path' },

  handler: (input, client) => executeCommand(pastMeetingsGetCommand, input, client),
};
