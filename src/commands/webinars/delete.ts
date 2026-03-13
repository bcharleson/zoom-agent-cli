import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const webinarsDeleteCommand: CommandDefinition = {
  name: 'webinars_delete',
  group: 'webinars',
  subcommand: 'delete',
  description: 'Delete a webinar.',
  examples: ['zoom webinars delete 12345678901'],

  inputSchema: z.object({
    webinarId: z.string().describe('Webinar ID'),
    occurrence_id: z.string().optional().describe('Occurrence ID for recurring webinars'),
    cancel_webinar_reminder: z.boolean().optional().describe('Send cancellation email'),
  }),

  cliMappings: {
    args: [{ field: 'webinarId', name: 'webinarId', required: true }],
    options: [
      { field: 'occurrence_id', flags: '--occurrence-id <id>', description: 'Occurrence ID' },
      { field: 'cancel_webinar_reminder', flags: '--cancel-webinar-reminder', description: 'Send cancellation email' },
    ],
  },

  endpoint: { method: 'DELETE', path: '/webinars/{webinarId}' },
  fieldMappings: { webinarId: 'path', occurrence_id: 'query', cancel_webinar_reminder: 'query' },

  handler: async (input, client) => {
    await client.delete(`/webinars/${encodeURIComponent(input.webinarId)}`, {
      occurrence_id: input.occurrence_id,
      cancel_webinar_reminder: input.cancel_webinar_reminder,
    });
    return { success: true, deleted: input.webinarId };
  },
};
