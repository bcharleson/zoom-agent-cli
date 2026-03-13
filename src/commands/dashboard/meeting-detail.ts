import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const dashboardMeetingDetailCommand: CommandDefinition = {
  name: 'dashboard_meeting_detail',
  group: 'dashboard',
  subcommand: 'meeting-detail',
  description: 'Get dashboard details for a specific meeting (quality metrics, network stats).',
  examples: ['zoom dashboard meeting-detail 12345678901'],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
    type: z.enum(['live', 'past', 'pastOne']).optional().describe('Meeting type'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
    options: [
      { field: 'type', flags: '-t, --type <type>', description: 'live|past|pastOne' },
    ],
  },

  endpoint: { method: 'GET', path: '/metrics/meetings/{meetingId}' },
  fieldMappings: { meetingId: 'path', type: 'query' },
  handler: (input, client) => executeCommand(dashboardMeetingDetailCommand, input, client),
};
