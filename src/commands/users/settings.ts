import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const usersSettingsCommand: CommandDefinition = {
  name: 'users_settings',
  group: 'users',
  subcommand: 'settings',
  description: 'Get user settings including meeting, recording, email notification, and feature settings.',
  examples: [
    'zoom users settings me',
    'zoom users settings user@example.com',
  ],

  inputSchema: z.object({
    userId: z.string().describe('User ID or email'),
    login_type: z.coerce.number().optional()
      .describe('Login type: 0=Facebook, 1=Google, 99=API, 100=Zoom, 101=SSO'),
    option: z.enum(['meeting_authentication', 'recording_authentication', 'meeting_security']).optional()
      .describe('Specific settings section'),
  }),

  cliMappings: {
    args: [{ field: 'userId', name: 'userId', required: true }],
    options: [
      { field: 'login_type', flags: '--login-type <type>', description: 'Login type' },
      { field: 'option', flags: '--option <option>', description: 'Settings section' },
    ],
  },

  endpoint: { method: 'GET', path: '/users/{userId}/settings' },
  fieldMappings: {
    userId: 'path',
    login_type: 'query',
    option: 'query',
  },

  handler: (input, client) => executeCommand(usersSettingsCommand, input, client),
};
