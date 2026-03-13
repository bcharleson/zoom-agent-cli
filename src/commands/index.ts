import { Command } from 'commander';
import type { CommandDefinition, GlobalOptions } from '../core/types.js';
import { resolveCredentials } from '../core/auth.js';
import { ZoomClient } from '../core/client.js';
import { output, outputError } from '../core/output.js';

// Auth commands (special — don't need an API client)
import { registerLoginCommand } from './auth/login.js';
import { registerLogoutCommand } from './auth/logout.js';
import { registerStatusCommand } from './auth/status.js';

// MCP command
import { registerMcpCommand } from './mcp/index.js';

// Meetings
import { meetingsListCommand } from './meetings/list.js';
import { meetingsGetCommand } from './meetings/get.js';
import { meetingsCreateCommand } from './meetings/create.js';
import { meetingsUpdateCommand } from './meetings/update.js';
import { meetingsDeleteCommand } from './meetings/delete.js';
import { meetingsEndCommand } from './meetings/end.js';
import { meetingsListRegistrantsCommand } from './meetings/list-registrants.js';
import { meetingsAddRegistrantCommand } from './meetings/add-registrant.js';
import { meetingsSummaryCommand } from './meetings/summary.js';

// Recordings
import { recordingsListCommand } from './recordings/list.js';
import { recordingsGetCommand } from './recordings/get.js';
import { recordingsDeleteCommand } from './recordings/delete.js';
import { recordingsDeleteFileCommand } from './recordings/delete-file.js';
import { recordingsRecoverCommand } from './recordings/recover.js';
import { recordingsSettingsCommand } from './recordings/settings.js';
import { recordingsTranscriptCommand } from './recordings/transcript.js';

// Users
import { usersListCommand } from './users/list.js';
import { usersGetCommand } from './users/get.js';
import { usersCreateCommand } from './users/create.js';
import { usersUpdateCommand } from './users/update.js';
import { usersDeleteCommand } from './users/delete.js';
import { usersSettingsCommand } from './users/settings.js';

// Past Meetings
import { pastMeetingsGetCommand } from './past-meetings/get.js';
import { pastMeetingsParticipantsCommand } from './past-meetings/participants.js';

// Webinars
import { webinarsListCommand } from './webinars/list.js';
import { webinarsGetCommand } from './webinars/get.js';
import { webinarsCreateCommand } from './webinars/create.js';
import { webinarsUpdateCommand } from './webinars/update.js';
import { webinarsDeleteCommand } from './webinars/delete.js';
import { webinarsListRegistrantsCommand } from './webinars/list-registrants.js';
import { webinarsAddRegistrantCommand } from './webinars/add-registrant.js';
import { webinarsListPanelistsCommand } from './webinars/list-panelists.js';
import { webinarsAddPanelistsCommand } from './webinars/add-panelists.js';
import { webinarsListPollsCommand } from './webinars/list-polls.js';

// Reports
import { reportsDailyCommand } from './reports/daily.js';
import { reportsUsersCommand } from './reports/users.js';
import { reportsMeetingCommand } from './reports/meeting.js';
import { reportsMeetingParticipantsCommand } from './reports/meeting-participants.js';
import { reportsCloudRecordingCommand } from './reports/cloud-recording.js';
import { reportsOperationLogsCommand } from './reports/operation-logs.js';

// Dashboard
import { dashboardMeetingsCommand } from './dashboard/meetings.js';
import { dashboardMeetingDetailCommand } from './dashboard/meeting-detail.js';
import { dashboardMeetingParticipantsCommand } from './dashboard/meeting-participants.js';
import { dashboardQualityCommand } from './dashboard/quality.js';

// Chat
import { chatListChannelsCommand } from './chat/list-channels.js';
import { chatGetChannelCommand } from './chat/get-channel.js';
import { chatCreateChannelCommand } from './chat/create-channel.js';
import { chatListMessagesCommand } from './chat/list-messages.js';
import { chatSendMessageCommand } from './chat/send-message.js';
import { chatUpdateMessageCommand } from './chat/update-message.js';
import { chatDeleteMessageCommand } from './chat/delete-message.js';
import { chatListMembersCommand } from './chat/list-members.js';

// Groups
import { groupsListCommand } from './groups/list.js';
import { groupsGetCommand } from './groups/get.js';
import { groupsCreateCommand } from './groups/create.js';
import { groupsUpdateCommand } from './groups/update.js';
import { groupsDeleteCommand } from './groups/delete.js';
import { groupsListMembersCommand } from './groups/list-members.js';
import { groupsAddMembersCommand } from './groups/add-members.js';

/** All command definitions — the single source of truth for CLI + MCP */
export const allCommands: CommandDefinition[] = [
  // Meetings
  meetingsListCommand,
  meetingsGetCommand,
  meetingsCreateCommand,
  meetingsUpdateCommand,
  meetingsDeleteCommand,
  meetingsEndCommand,
  meetingsListRegistrantsCommand,
  meetingsAddRegistrantCommand,
  meetingsSummaryCommand,
  // Recordings
  recordingsListCommand,
  recordingsGetCommand,
  recordingsDeleteCommand,
  recordingsDeleteFileCommand,
  recordingsRecoverCommand,
  recordingsSettingsCommand,
  recordingsTranscriptCommand,
  // Users
  usersListCommand,
  usersGetCommand,
  usersCreateCommand,
  usersUpdateCommand,
  usersDeleteCommand,
  usersSettingsCommand,
  // Past Meetings
  pastMeetingsGetCommand,
  pastMeetingsParticipantsCommand,
  // Webinars
  webinarsListCommand,
  webinarsGetCommand,
  webinarsCreateCommand,
  webinarsUpdateCommand,
  webinarsDeleteCommand,
  webinarsListRegistrantsCommand,
  webinarsAddRegistrantCommand,
  webinarsListPanelistsCommand,
  webinarsAddPanelistsCommand,
  webinarsListPollsCommand,
  // Reports
  reportsDailyCommand,
  reportsUsersCommand,
  reportsMeetingCommand,
  reportsMeetingParticipantsCommand,
  reportsCloudRecordingCommand,
  reportsOperationLogsCommand,
  // Dashboard
  dashboardMeetingsCommand,
  dashboardMeetingDetailCommand,
  dashboardMeetingParticipantsCommand,
  dashboardQualityCommand,
  // Chat
  chatListChannelsCommand,
  chatGetChannelCommand,
  chatCreateChannelCommand,
  chatListMessagesCommand,
  chatSendMessageCommand,
  chatUpdateMessageCommand,
  chatDeleteMessageCommand,
  chatListMembersCommand,
  // Groups
  groupsListCommand,
  groupsGetCommand,
  groupsCreateCommand,
  groupsUpdateCommand,
  groupsDeleteCommand,
  groupsListMembersCommand,
  groupsAddMembersCommand,
];

export function registerAllCommands(program: Command): void {
  // Register auth commands (special handling — no API client needed)
  registerLoginCommand(program);
  registerLogoutCommand(program);
  registerStatusCommand(program);

  // Register MCP server command
  registerMcpCommand(program);

  // Group commands by their `group` field
  const groups = new Map<string, CommandDefinition[]>();
  for (const cmd of allCommands) {
    if (!groups.has(cmd.group)) groups.set(cmd.group, []);
    groups.get(cmd.group)!.push(cmd);
  }

  for (const [groupName, commands] of groups) {
    const groupCmd = program
      .command(groupName)
      .description(`Manage ${groupName}`);

    for (const cmdDef of commands) {
      registerCommand(groupCmd, cmdDef);
    }

    groupCmd.on('command:*', (operands: string[]) => {
      const available = commands.map((c) => c.subcommand).join(', ');
      console.error(`error: unknown command '${operands[0]}' for '${groupName}'`);
      console.error(`Available commands: ${available}`);
      process.exitCode = 1;
    });
  }
}

function registerCommand(parent: Command, cmdDef: CommandDefinition): void {
  const cmd = parent
    .command(cmdDef.subcommand)
    .description(cmdDef.description);

  // Register positional arguments
  if (cmdDef.cliMappings.args) {
    for (const arg of cmdDef.cliMappings.args) {
      const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
      cmd.argument(argStr, `${arg.field}`);
    }
  }

  // Register options
  if (cmdDef.cliMappings.options) {
    for (const opt of cmdDef.cliMappings.options) {
      cmd.option(opt.flags, opt.description ?? '');
    }
  }

  // Add examples to help
  if (cmdDef.examples?.length) {
    cmd.addHelpText('after', '\nExamples:\n' + cmdDef.examples.map((e) => `  $ ${e}`).join('\n'));
  }

  cmd.action(async (...actionArgs: any[]) => {
    try {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions & Record<string, any>;

      if (globalOpts.pretty) {
        globalOpts.output = 'pretty';
      }

      const credentials = await resolveCredentials({
        accountId: globalOpts.accountId,
        clientId: globalOpts.clientId,
        clientSecret: globalOpts.clientSecret,
      });
      const client = new ZoomClient({ credentials });

      // Build input from positional args + options
      const input: Record<string, any> = {};

      if (cmdDef.cliMappings.args) {
        for (let i = 0; i < cmdDef.cliMappings.args.length; i++) {
          const argDef = cmdDef.cliMappings.args[i];
          if (actionArgs[i] !== undefined) {
            input[argDef.field] = actionArgs[i];
          }
        }
      }

      if (cmdDef.cliMappings.options) {
        for (const opt of cmdDef.cliMappings.options) {
          const match = opt.flags.match(/--([a-z-]+)/);
          if (match) {
            const optName = match[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            if (globalOpts[optName] !== undefined) {
              input[opt.field] = globalOpts[optName];
            }
          }
        }
      }

      // Validate input against schema
      const parsed = cmdDef.inputSchema.safeParse(input);
      if (!parsed.success) {
        const issues = parsed.error.issues ?? [];
        const missing = issues
          .filter((i: any) => i.code === 'invalid_type' && String(i.message).includes('received undefined'))
          .map((i: any) => '--' + String(i.path?.[0] ?? '').replace(/_/g, '-'));
        if (missing.length > 0) {
          throw new Error(`Missing required option(s): ${missing.join(', ')}`);
        }
        const msg = issues.map((i: any) => `${i.path?.join('.')}: ${i.message}`).join('; ');
        throw new Error(`Invalid input: ${msg}`);
      }

      const result = await cmdDef.handler(parsed.data, client);
      output(result, globalOpts);
    } catch (error) {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      outputError(error, globalOpts);
    }
  });
}
