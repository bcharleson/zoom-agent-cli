import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';
import { executeCommand } from '../../core/handler.js';

export const reportsDailyCommand: CommandDefinition = {
  name: 'reports_daily',
  group: 'reports',
  subcommand: 'daily',
  description: 'Get daily usage report with new users, meetings, participants, and meeting minutes.',
  examples: ['zoom reports daily --year 2026 --month 3'],

  inputSchema: z.object({
    year: z.coerce.number().optional().describe('Year (YYYY)'),
    month: z.coerce.number().min(1).max(12).optional().describe('Month (1-12)'),
  }),

  cliMappings: {
    options: [
      { field: 'year', flags: '--year <year>', description: 'Year (YYYY)' },
      { field: 'month', flags: '--month <month>', description: 'Month (1-12)' },
    ],
  },

  endpoint: { method: 'GET', path: '/report/daily' },
  fieldMappings: { year: 'query', month: 'query' },
  handler: (input, client) => executeCommand(reportsDailyCommand, input, client),
};
