import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

export const usersDeleteCommand: CommandDefinition = {
  name: 'users_delete',
  group: 'users',
  subcommand: 'delete',
  description: 'Delete or disassociate a user from the account.',
  examples: [
    'zoom users delete user@example.com --action disassociate',
    'zoom users delete user-id-123 --action delete',
  ],

  inputSchema: z.object({
    userId: z.string().describe('User ID or email'),
    action: z.enum(['disassociate', 'delete']).default('disassociate')
      .describe('"disassociate" (keep account) or "delete" (permanent)'),
    transfer_email: z.string().optional()
      .describe('Email to transfer meetings/webinars/recordings to'),
    transfer_meetings: z.boolean().optional()
      .describe('Transfer meetings to transfer_email'),
    transfer_webinars: z.boolean().optional()
      .describe('Transfer webinars to transfer_email'),
    transfer_recordings: z.boolean().optional()
      .describe('Transfer recordings to transfer_email'),
  }),

  cliMappings: {
    args: [{ field: 'userId', name: 'userId', required: true }],
    options: [
      { field: 'action', flags: '--action <action>', description: 'disassociate or delete' },
      { field: 'transfer_email', flags: '--transfer-email <email>', description: 'Transfer assets to this email' },
      { field: 'transfer_meetings', flags: '--transfer-meetings', description: 'Transfer meetings' },
      { field: 'transfer_webinars', flags: '--transfer-webinars', description: 'Transfer webinars' },
      { field: 'transfer_recordings', flags: '--transfer-recordings', description: 'Transfer recordings' },
    ],
  },

  endpoint: { method: 'DELETE', path: '/users/{userId}' },

  fieldMappings: {
    userId: 'path',
    action: 'query',
    transfer_email: 'query',
    transfer_meetings: 'query',
    transfer_webinars: 'query',
    transfer_recordings: 'query',
  },

  handler: async (input, client) => {
    const query: Record<string, any> = { action: input.action };
    if (input.transfer_email) query.transfer_email = input.transfer_email;
    if (input.transfer_meetings) query.transfer_meetings = input.transfer_meetings;
    if (input.transfer_webinars) query.transfer_webinars = input.transfer_webinars;
    if (input.transfer_recordings) query.transfer_recordings = input.transfer_recordings;
    await client.delete(`/users/${encodeURIComponent(input.userId)}`, query);
    return { success: true, deleted: input.userId };
  },
};
