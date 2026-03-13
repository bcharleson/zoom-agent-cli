import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const meetingsGetCommand: CommandDefinition = {
  name: 'meetings_get',
  group: 'meetings',
  subcommand: 'get',
  description: 'Get meeting details by ID. Returns full meeting configuration including settings, recurrence, and tracking fields.',
  examples: [
    'zoom meetings get 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID'),
    show_previous_occurrences: z.boolean().optional()
      .describe('Include previous occurrences for recurring meetings'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'show_previous_occurrences', flags: '--show-previous-occurrences', description: 'Include previous occurrences' },
    ],
  },

  endpoint: { method: 'GET', path: '/meetings/{meetingId}' },
  fieldMappings: {
    meetingId: 'path',
    show_previous_occurrences: 'query',
  },

  handler: (input, client) => executeCommand(meetingsGetCommand, input, client),
};
