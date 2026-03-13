# zoom-agent-cli — AI Agent Guide

## Quick Start (No Browser Needed)

```bash
# Set credentials via environment variables
export ZOOM_ACCOUNT_ID="your-account-id"
export ZOOM_CLIENT_ID="your-client-id"
export ZOOM_CLIENT_SECRET="your-client-secret"

# Test connectivity
zoom status

# List upcoming meetings
zoom meetings list --user-id me --type upcoming --pretty
```

## MCP Server Setup

Add to your MCP config (e.g., `~/.claude.json`):

```json
{
  "mcpServers": {
    "zoom": {
      "command": "npx",
      "args": ["-y", "zoom-agent-cli", "mcp"],
      "env": {
        "ZOOM_ACCOUNT_ID": "your-account-id",
        "ZOOM_CLIENT_ID": "your-client-id",
        "ZOOM_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Or if installed globally (`npm install -g zoom-agent-cli`):

```json
{
  "mcpServers": {
    "zoom": {
      "command": "zoom",
      "args": ["mcp"],
      "env": {
        "ZOOM_ACCOUNT_ID": "your-account-id",
        "ZOOM_CLIENT_ID": "your-client-id",
        "ZOOM_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Authentication

Three-tier credential resolution (checked in order):
1. **CLI flags:** `--account-id`, `--client-id`, `--client-secret`
2. **Environment variables:** `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`
3. **Stored config:** `~/.zoom-cli/config.json` (created via `zoom login`)

For agents, use environment variables (option 2).

## Output Format

- **stdout:** JSON data (compact by default, `--pretty` for indented)
- **stderr:** JSON errors `{"error": "message", "code": "ERROR_CODE"}`
- **Exit codes:** 0 = success, 1 = error
- **`--fields`:** Filter output fields: `--fields id,topic,start_time`
- **`--quiet`:** Exit code only, no output

## Command Reference (59 commands across 9 groups)

### meetings (9 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom meetings list` | `meetings_list` | List meetings for a user |
| `zoom meetings get <id>` | `meetings_get` | Get meeting details |
| `zoom meetings create` | `meetings_create` | Create a meeting |
| `zoom meetings update <id>` | `meetings_update` | Update a meeting |
| `zoom meetings delete <id>` | `meetings_delete` | Delete a meeting |
| `zoom meetings end <id>` | `meetings_end` | End a live meeting |
| `zoom meetings list-registrants <id>` | `meetings_list_registrants` | List meeting registrants |
| `zoom meetings add-registrant <id>` | `meetings_add_registrant` | Add a registrant |
| `zoom meetings summary <id>` | `meetings_summary` | Get AI Companion summary |

### recordings (7 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom recordings list` | `recordings_list` | List user's recordings |
| `zoom recordings get <meetingId>` | `recordings_get` | Get recording files & URLs |
| `zoom recordings delete <meetingId>` | `recordings_delete` | Delete all recording files |
| `zoom recordings delete-file <meetingId> <recordingId>` | `recordings_delete_file` | Delete specific file |
| `zoom recordings recover <meetingId>` | `recordings_recover` | Recover from trash |
| `zoom recordings settings <meetingId>` | `recordings_settings` | Get recording settings |
| `zoom recordings transcript <meetingId>` | `recordings_transcript` | Get meeting transcript |

### users (6 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom users list` | `users_list` | List all users |
| `zoom users get <userId>` | `users_get` | Get user details |
| `zoom users create` | `users_create` | Create a user |
| `zoom users update <userId>` | `users_update` | Update user profile |
| `zoom users delete <userId>` | `users_delete` | Delete/disassociate user |
| `zoom users settings <userId>` | `users_settings` | Get user settings |

### past-meetings (2 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom past-meetings get <uuid>` | `past_meetings_get` | Get past meeting details |
| `zoom past-meetings participants <uuid>` | `past_meetings_participants` | Get participant list |

### webinars (10 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom webinars list` | `webinars_list` | List webinars |
| `zoom webinars get <id>` | `webinars_get` | Get webinar details |
| `zoom webinars create` | `webinars_create` | Create a webinar |
| `zoom webinars update <id>` | `webinars_update` | Update a webinar |
| `zoom webinars delete <id>` | `webinars_delete` | Delete a webinar |
| `zoom webinars list-registrants <id>` | `webinars_list_registrants` | List registrants |
| `zoom webinars add-registrant <id>` | `webinars_add_registrant` | Add registrant |
| `zoom webinars list-panelists <id>` | `webinars_list_panelists` | List panelists |
| `zoom webinars add-panelists <id>` | `webinars_add_panelists` | Add panelists |
| `zoom webinars list-polls <id>` | `webinars_list_polls` | List polls |

### reports (6 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom reports daily` | `reports_daily` | Daily usage report |
| `zoom reports users` | `reports_users` | Active/inactive host report |
| `zoom reports meeting <id>` | `reports_meeting` | Meeting detail report |
| `zoom reports meeting-participants <id>` | `reports_meeting_participants` | Participant report |
| `zoom reports cloud-recording` | `reports_cloud_recording` | Recording usage report |
| `zoom reports operation-logs` | `reports_operation_logs` | Admin operation logs |

### dashboard (4 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom dashboard meetings` | `dashboard_meetings` | List meetings (quality) |
| `zoom dashboard meeting-detail <id>` | `dashboard_meeting_detail` | Meeting quality detail |
| `zoom dashboard meeting-participants <id>` | `dashboard_meeting_participants` | Participant quality |
| `zoom dashboard quality` | `dashboard_quality` | Overall quality scores |

### chat (8 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom chat list-channels` | `chat_list_channels` | List chat channels |
| `zoom chat get-channel <id>` | `chat_get_channel` | Get channel details |
| `zoom chat create-channel` | `chat_create_channel` | Create a channel |
| `zoom chat list-messages` | `chat_list_messages` | List chat messages |
| `zoom chat send-message` | `chat_send_message` | Send a message |
| `zoom chat update-message <id>` | `chat_update_message` | Update a message |
| `zoom chat delete-message <id>` | `chat_delete_message` | Delete a message |
| `zoom chat list-members <id>` | `chat_list_members` | List channel members |

### groups (7 commands)
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `zoom groups list` | `groups_list` | List all groups |
| `zoom groups get <id>` | `groups_get` | Get group details |
| `zoom groups create` | `groups_create` | Create a group |
| `zoom groups update <id>` | `groups_update` | Update group name |
| `zoom groups delete <id>` | `groups_delete` | Delete a group |
| `zoom groups list-members <id>` | `groups_list_members` | List group members |
| `zoom groups add-members <id>` | `groups_add_members` | Add members to group |

## Required Zoom App Scopes

For your Server-to-Server OAuth app in the Zoom Marketplace, enable:

```
meeting:read:admin        meeting:write:admin
recording:read:admin      recording:write:admin
user:read:admin           user:write:admin
report:read:admin
dashboard:read:admin      dashboard_meetings:read:admin
webinar:read:admin        webinar:write:admin
chat_channel:read:admin   chat_channel:write:admin
chat_message:read:admin   chat_message:write:admin
group:read:admin          group:write:admin
meeting_summary:read:admin
```

## Common Patterns

```bash
# List upcoming meetings as JSON
zoom meetings list --user-id me --type upcoming

# Create a scheduled meeting
zoom meetings create --topic "Sprint Review" --type 2 --duration 60 \
  --start-time "2026-03-15T14:00:00Z" --timezone "America/New_York"

# Get recording with download URLs
zoom recordings get <meeting-id> --include-fields download_access_token

# Get AI meeting summary
zoom meetings summary <meeting-uuid>

# Get past meeting participants
zoom past-meetings participants <meeting-uuid>

# Send a chat message
zoom chat send-message --to-channel <channel-id> --message "Deployment complete"

# Get daily usage report
zoom reports daily --year 2026 --month 3
```
