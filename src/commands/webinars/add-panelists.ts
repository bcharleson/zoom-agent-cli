import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const webinarsAddPanelistsCommand: CommandDefinition = {
  name: 'webinars_add_panelists',
  group: 'webinars',
  subcommand: 'add-panelists',
  description: 'Add panelists to a webinar.',
  examples: ['zoom webinars add-panelists 12345678901 --panelists \'[{"name":"John","email":"john@example.com"}]\''],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
    panelists: z.preprocess(
      (v) => (typeof v === 'string' ? JSON.parse(v) : v),
      z.array(z.object({ name: z.string(), email: z.string() })),
    ).describe('Array of panelist objects with name and email'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
    options: [
      { field: 'panelists', flags: '--panelists <json>', description: 'Panelists JSON array [{name, email}]' },
    ],
  },

  endpoint: { method: 'POST', path: '/webinars/{webinarId}/panelists' },
  fieldMappings: { webinarId: 'path', panelists: 'body' },

  handler: async (input, client) => {
    return client.post(`/webinars/${encodeURIComponent(input.webinarId)}/panelists`, {
      panelists: input.panelists,
    });
  },
};
