import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const webinarsListPanelistsCommand: CommandDefinition = {
  name: 'webinars_list_panelists',
  group: 'webinars',
  subcommand: 'list-panelists',
  description: 'List panelists for a webinar.',
  examples: ['zoom webinars list-panelists 12345678901'],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
  },

  endpoint: { method: 'GET', path: '/webinars/{webinarId}/panelists' },
  fieldMappings: { webinarId: 'path' },
  handler: (input, client) => executeCommand(webinarsListPanelistsCommand, input, client),
};
