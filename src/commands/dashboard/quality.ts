import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const dashboardQualityCommand: CommandDefinition = {
  name: 'dashboard_quality',
  group: 'dashboard',
  subcommand: 'quality',
  description: 'Get overall meeting quality scores from the dashboard.',
  examples: ['zoom dashboard quality --from 2026-03-01 --to 2026-03-11'],

  inputSchema: z.object({
    from: z.string().describe('Start date (YYYY-MM-DD)'),
    to: z.string().describe('End date (YYYY-MM-DD)'),
    type: z.enum(['meeting', 'webinar']).optional().describe('meeting or webinar'),
  }),

  cliMappings: {
    options: [
      { field: 'from', flags: '--from <date>', description: 'Start date' },
      { field: 'to', flags: '--to <date>', description: 'End date' },
      { field: 'type', flags: '-t, --type <type>', description: 'meeting|webinar' },
    ],
  },

  endpoint: { method: 'GET', path: '/metrics/quality' },
  fieldMappings: { from: 'query', to: 'query', type: 'query' },
  handler: (input, client) => executeCommand(dashboardQualityCommand, input, client),
};
