import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const webinarsListPollsCommand: CommandDefinition = {
  name: 'webinars_list_polls',
  group: 'webinars',
  subcommand: 'list-polls',
  description: 'List polls for a webinar.',
  examples: ['zoom webinars list-polls 12345678901'],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
  },

  endpoint: { method: 'GET', path: '/webinars/{webinarId}/polls' },
  fieldMappings: { webinarId: 'path' },
  handler: (input, client) => executeCommand(webinarsListPollsCommand, input, client),
};
