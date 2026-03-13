import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const reportsMeetingCommand: CommandDefinition = {
  name: 'reports_meeting',
  group: 'reports',
  subcommand: 'meeting',
  description: 'Get a detailed report for a past meeting.',
  examples: ['zoom reports meeting 12345678901'],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  endpoint: { method: 'GET', path: '/report/meetings/{meetingId}' },
  fieldMappings: { meetingId: 'path' },
  handler: (input, client) => executeCommand(reportsMeetingCommand, input, client),
};
