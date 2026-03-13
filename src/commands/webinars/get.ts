import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const webinarsGetCommand: CommandDefinition = {
  name: 'webinars_get',
  group: 'webinars',
  subcommand: 'get',
  description: 'Get webinar details by ID.',
  examples: ['zoom webinars get 12345678901'],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
    show_previous_occurrences: z.boolean().optional().describe('Include previous occurrences'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
    options: [
      { field: 'show_previous_occurrences', flags: '--show-previous-occurrences', description: 'Include previous occurrences' },
    ],
  },

  endpoint: { method: 'GET', path: '/webinars/{webinarId}' },
  fieldMappings: { webinarId: 'path', show_previous_occurrences: 'query' },
  handler: (input, client) => executeCommand(webinarsGetCommand, input, client),
};
