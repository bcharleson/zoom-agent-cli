import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const recordingsListCommand: CommandDefinition = {
  name: 'recordings_list',
  group: 'recordings',
  subcommand: 'list',
  description: 'List cloud recordings for a user. Returns recording files with download URLs.',
  examples: [
    'zoom recordings list --user-id me',
    'zoom recordings list --user-id me --from 2026-03-01 --to 2026-03-11',
  ],

  inputSchema: z.object({
    userId: z.string().default('me').describe('User ID or email'),
    from: z.string().optional().describe('Start date (YYYY-MM-DD). Defaults to current date.'),
    to: z.string().optional().describe('End date (YYYY-MM-DD). Max range is 1 month.'),
    page_size: z.coerce.number().min(1).max(300).optional().describe('Results per page'),
    next_page_token: z.string().optional().describe('Pagination token'),
    trash: z.boolean().optional().describe('List recordings from trash'),
    trash_type: z.enum(['meeting_recordings', 'recording_file']).optional()
      .describe('Trash type filter when trash=true'),
    meeting_id: z.coerce.number().optional().describe('Filter by meeting ID'),
  }),

  cliMappings: {
    options: [
      { field: 'userId', flags: '-u, --user-id <userId>', description: 'User ID or email (default: "me")' },
      { field: 'from', flags: '--from <date>', description: 'Start date (YYYY-MM-DD)' },
      { field: 'to', flags: '--to <date>', description: 'End date (YYYY-MM-DD)' },
      { field: 'page_size', flags: '--page-size <number>', description: 'Results per page' },
      { field: 'next_page_token', flags: '--next-page-token <token>', description: 'Pagination token' },
      { field: 'trash', flags: '--trash', description: 'List from trash' },
      { field: 'trash_type', flags: '--trash-type <type>', description: 'meeting_recordings|recording_file' },
      { field: 'meeting_id', flags: '--meeting-id <id>', description: 'Filter by meeting ID' },
    ],
  },

  endpoint: { method: 'GET', path: '/users/{userId}/recordings' },

  fieldMappings: {
    userId: 'path',
    from: 'query',
    to: 'query',
    page_size: 'query',
    next_page_token: 'query',
    trash: 'query',
    trash_type: 'query',
    meeting_id: 'query',
  },

  paginated: true,

  handler: (input, client) => executeCommand(recordingsListCommand, input, client),
};
