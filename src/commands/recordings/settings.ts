import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const recordingsSettingsCommand: CommandDefinition = {
  name: 'recordings_settings',
  group: 'recordings',
  subcommand: 'settings',
  description: 'Get recording settings for a meeting (sharing, password, viewer download, etc.).',
  examples: [
    'zoom recordings settings 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  endpoint: { method: 'GET', path: '/meetings/{meetingId}/recordings/settings' },
  fieldMappings: { meetingId: 'path' },

  handler: (input, client) => executeCommand(recordingsSettingsCommand, input, client),
};
