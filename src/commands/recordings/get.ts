import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const recordingsGetCommand: CommandDefinition = {
  name: 'recordings_get',
  group: 'recordings',
  subcommand: 'get',
  description: 'Get recording files for a meeting. Returns download URLs, file types, sizes, and recording metadata.',
  examples: [
    'zoom recordings get 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
    include_fields: z.string().optional()
      .describe('Additional fields to include (e.g., "download_access_token")'),
    ttl: z.coerce.number().optional()
      .describe('Time to live for download URLs in seconds'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'include_fields', flags: '--include-fields <fields>', description: 'Additional fields (e.g., download_access_token)' },
      { field: 'ttl', flags: '--ttl <seconds>', description: 'Download URL TTL in seconds' },
    ],
  },

  endpoint: { method: 'GET', path: '/meetings/{meetingId}/recordings' },
  fieldMappings: {
    meetingId: 'path',
    include_fields: 'query',
    ttl: 'query',
  },

  handler: (input, client) => executeCommand(recordingsGetCommand, input, client),
};
