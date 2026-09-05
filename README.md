# zoom-agent-cli

> CLI and MCP server for the full Zoom API — built for humans and AI agents.

[![npm version](https://img.shields.io/npm/v/zoom-agent-cli.svg)](https://www.npmjs.com/package/zoom-agent-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**59 commands** across meetings, recordings, users, webinars, reports, dashboard, chat, and groups. Every command is available both as a CLI subcommand and as an MCP tool — same schema, same auth, one codebase.

---

## Install

```bash
npm install -g zoom-agent-cli
```

---

## Step 1 — Create a Zoom Server-to-Server OAuth App

This tool uses **Server-to-Server OAuth** — no browser login, no user interaction. You exchange account credentials for a short-lived access token automatically on every request.

### Create the app

1. Go to [marketplace.zoom.us](https://marketplace.zoom.us) → **Develop** → **Build App**
2. Choose **Server-to-Server OAuth**
3. Name it anything (e.g., `zoom-agent-cli`)
4. Under **App Credentials**, copy your:
   - **Account ID**
   - **Client ID**
   - **Client Secret**

### Add required scopes

New Marketplace **Server-to-Server OAuth** apps use **granular** scopes (for example `meeting:read:list_meetings:admin`). Older apps may still show classic umbrellas such as `meeting:read:admin` and `recording:read:admin`.

If an API error says `does not contain scopes:[…]`, add the **exact slug** from that message, then **re-activate** the app. A missing scope is an app-config problem, not a CLI bug.

#### Transcript-only (status + recordings list + VTT)

Minimum to run `zoom status`, `zoom recordings list`, and `zoom recordings transcript`:

| Command | Granular S2S scope | Classic (legacy apps) |
|---------|--------------------|------------------------|
| `zoom status` (`GET /users/me`) | `user:read:user:admin` | `user:read:admin` |
| `zoom recordings list` | `cloud_recording:read:list_user_recordings:admin` | `recording:read:admin` |
| `zoom recordings get` / `transcript` (VTT download) | `cloud_recording:read:list_recording_files:admin` | `recording:read:admin` |

`recordings transcript` is not a standalone Zoom API. It lists recording files and downloads the `TRANSCRIPT` / `audio_transcript` VTT.

#### Full CLI surface (granular `:admin` slugs)

Add these on a new S2S app for the whole command set. Search the Scopes tab by the human-readable label if a slug is hidden.

| Group | Granular scopes |
|-------|-----------------|
| **meetings** | `meeting:read:list_meetings:admin` `meeting:read:meeting:admin` `meeting:write:meeting:admin` `meeting:update:meeting:admin` `meeting:delete:meeting:admin` `meeting:update:status:admin` `meeting:read:list_registrants:admin` `meeting:write:registrant:admin` `meeting:read:summary:admin` |
| **past-meetings** | `meeting:read:past_meeting:admin` `meeting:read:list_past_participants:admin` |
| **recordings** | `cloud_recording:read:list_user_recordings:admin` `cloud_recording:read:list_recording_files:admin` `cloud_recording:read:recording_settings:admin` `cloud_recording:delete:meeting_recording:admin` `cloud_recording:delete:recording_file:admin` `cloud_recording:update:recover_meeting_recordings:admin` |
| **users** | `user:read:user:admin` `user:read:list_users:admin` `user:write:user:admin` `user:update:user:admin` `user:delete:user:admin` `user:read:settings:admin` |
| **webinars** | `webinar:read:list_webinars:admin` `webinar:read:webinar:admin` `webinar:write:webinar:admin` `webinar:update:webinar:admin` `webinar:delete:webinar:admin` `webinar:read:list_registrants:admin` `webinar:write:registrant:admin` `webinar:read:list_panelists:admin` `webinar:write:panelist:admin` `webinar:read:list_polls:admin` |
| **reports** | `report:read:meeting:admin` `report:read:list_meeting_participants:admin` `report:read:list_users:admin` `report:read:operation_logs:admin` (daily / cloud-recording usage: search Marketplace for those labels, or use classic `report:read:admin`) |
| **dashboard** | `dashboard:read:list_meetings:admin` `dashboard:read:meeting:admin` `dashboard:read:list_meeting_participants:admin` `dashboard:read:meeting_quality_score:admin` |
| **chat** | `team_chat:read:list_user_channels:admin` `team_chat:read:user_channel:admin` `team_chat:write:user_channel:admin` `team_chat:read:list_user_messages:admin` `team_chat:write:user_message:admin` `team_chat:update:user_message:admin` `team_chat:delete:user_message:admin` `team_chat:read:list_members:admin` |
| **groups** | `group:read:list_groups:admin` `group:read:group:admin` `group:write:group:admin` `group:update:group:admin` `group:delete:group:admin` `group:read:list_members:admin` `group:write:member:admin` |

#### Classic scopes (legacy apps)

| Group | Required scopes |
|-------|-----------------|
| **meetings** | `meeting:read:admin` `meeting:write:admin` |
| **recordings** | `recording:read:admin` `recording:write:admin` |
| **users** | `user:read:admin` `user:write:admin` |
| **webinars** | `webinar:read:admin` `webinar:write:admin` |
| **reports** | `report:read:admin` |
| **dashboard** | `dashboard:read:admin` `dashboard_meetings:read:admin` |
| **chat** | `chat_channel:read:admin` `chat_channel:write:admin` `chat_message:read:admin` `chat_message:write:admin` |
| **groups** | `group:read:admin` `group:write:admin` |
| **AI summary** | `meeting_summary:read:admin` |

> **Tip:** For a read-only agent, add only the `:read:` / `:read:admin` variants. Live smoke (`npm run test:e2e:smoke`) treats missing-scope errors on `meetings list` and `past-meetings *` as **SKIP** (app config), not **FAIL**.

### Activate the app

Click **Activate your app** in the Marketplace — the app must be active for tokens to be issued.

---

## Step 2 — Configure Credentials

Three ways to provide credentials (checked in this order):

### Option A — Environment variables (recommended for agents)

```bash
export ZOOM_ACCOUNT_ID="your-account-id"
export ZOOM_CLIENT_ID="your-client-id"
export ZOOM_CLIENT_SECRET="your-client-secret"
```

### Option B — Interactive login (recommended for local CLI use)

```bash
zoom login
```

Stores credentials in `~/.zoom-agent-cli/config.json` (mode `0600`).

### Option C — Per-command flags

```bash
zoom meetings list \
  --account-id "..." \
  --client-id "..." \
  --client-secret "..."
```

---

## Step 3 — Verify

```bash
zoom status
```

```
Credentials found:
  Account ID: 12345678...
  Client ID:  abcdefgh...
  Client Secret: ****

Testing API connection...
Connected as: Jane Doe (jane@example.com)
```

### Live E2E smoke

From a clone (not required for everyday CLI use):

```bash
export ZOOM_ACCOUNT_ID="your-account-id"
export ZOOM_CLIENT_ID="your-client-id"
export ZOOM_CLIENT_SECRET="your-client-secret"

npm install
npm test                 # unit tests (vitest) — no Zoom account needed
npm run test:e2e:smoke   # live S2S checks
```

`test:e2e:smoke` (also `scripts/e2e-smoke`) hits the live Zoom API when all three env vars are set and **exits 0 without calling Zoom** when they are unset. It covers:

| Check | Missing-scope / empty data | Real CLI or API bug |
|-------|----------------------------|---------------------|
| `status` | — | **FAIL** |
| `recordings list` | **SKIP** if the token lacks recording scopes | **FAIL** |
| `recordings transcript` | **SKIP** if no `TRANSCRIPT` file in the last 30 days | **FAIL** if a transcript file exists but download/parse breaks |
| `meetings list` | **SKIP** (needs `meeting:read:list_meetings` / `:admin`) | **FAIL** |
| `past-meetings get` / `participants` | **SKIP** (needs `meeting:read:past_meeting` / `list_past_participants`) | **FAIL** |

The runner never prints credentials, download tokens, or full VTT bodies — only the first WEBVTT line and character length. Optional overrides: `ZOOM_E2E_USER_ID` (default `me`), `ZOOM_E2E_FROM` / `ZOOM_E2E_TO` (`YYYY-MM-DD`), `ZOOM_E2E_MEETING_ID`.

---

## CLI Usage

```
zoom [options] [command]

Options:
  --account-id <id>       Zoom Account ID
  --client-id <id>        Zoom Client ID
  --client-secret <sec>   Zoom Client Secret
  --output <format>       json (default) or pretty
  --pretty                Shorthand for --output pretty
  --quiet                 Exit code only, no output
  --fields <fields>       Comma-separated fields to return

Commands:
  login                   Store credentials interactively
  logout                  Remove stored credentials
  status                  Test connectivity
  mcp                     Start MCP server (stdio)
  meetings                Manage meetings (9 commands)
  recordings              Manage recordings (7 commands)
  users                   Manage users (6 commands)
  past-meetings           Access past meeting data (2 commands)
  webinars                Manage webinars (10 commands)
  reports                 Usage and audit reports (6 commands)
  dashboard               Quality metrics (4 commands)
  chat                    Team Chat channels and messages (8 commands)
  groups                  User groups (7 commands)
```

### Examples

```bash
# List upcoming meetings
zoom meetings list --type upcoming --pretty

# Create a scheduled meeting
zoom meetings create \
  --topic "Sprint Review" \
  --type 2 \
  --duration 60 \
  --start-time "2026-03-15T14:00:00Z" \
  --timezone "America/New_York"

# Get recording files with download URLs
zoom recordings get <meeting-id>

# Get AI Companion meeting summary
zoom meetings summary <meeting-uuid>

# Get transcript for a recorded meeting
zoom recordings transcript <meeting-id>

# Get past meeting participants with join/leave times
zoom past-meetings participants <meeting-uuid>

# Send a chat message to a channel
zoom chat send-message \
  --to-channel <channel-id> \
  --message "Deployment complete ✓"

# Pull admin operation logs
zoom reports operation-logs --from 2026-03-01 --to 2026-03-13

# Filter output to specific fields
zoom users list --fields id,email,first_name,last_name --pretty
```

---

## MCP Server (for AI Agents)

Every CLI command is also available as an MCP tool. Start the server:

```bash
zoom mcp
```

### Claude Code / Claude Desktop config

Add to `~/.claude.json` (or your MCP config file):

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

If installed globally:

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

### MCP tools exposed

All 59 tools follow the naming convention `{group}_{subcommand}`:

| Tool | Description |
|------|-------------|
| `meetings_list` | List meetings for a user |
| `meetings_get` | Get meeting details |
| `meetings_create` | Create a meeting |
| `meetings_update` | Update a meeting |
| `meetings_delete` | Delete a meeting |
| `meetings_end` | End a live meeting |
| `meetings_summary` | Get AI Companion meeting summary |
| `recordings_list` | List cloud recordings |
| `recordings_get` | Get recording files and download URLs |
| `recordings_transcript` | Get meeting transcript (VTT from recording files) |
| `recordings_settings` | Get recording sharing settings |
| `users_list` | List all account users |
| `users_get` | Get user details |
| `past_meetings_get` | Get past meeting instance details |
| `past_meetings_participants` | Get participant list with join/leave times |
| `webinars_list` | List webinars |
| `webinars_get` | Get webinar details |
| `reports_daily` | Daily usage report |
| `reports_meeting_participants` | Participant report for a meeting |
| `reports_operation_logs` | Admin operation audit log |
| `dashboard_meetings` | Live/past meetings with quality metrics |
| `dashboard_quality` | Overall quality scores |
| `chat_list_channels` | List chat channels |
| `chat_send_message` | Send a message to channel or contact |
| `chat_list_messages` | List chat message history |
| `groups_list` | List all groups |
| … | *(59 total — run `zoom mcp` to see all)* |

---

## Command Reference

### meetings

| Command | Description |
|---------|-------------|
| `zoom meetings list [options]` | List meetings (`--type upcoming\|live\|scheduled`) |
| `zoom meetings get <meetingId>` | Get meeting details |
| `zoom meetings create [options]` | Create a meeting |
| `zoom meetings update <meetingId> [options]` | Update a meeting |
| `zoom meetings delete <meetingId>` | Delete a meeting |
| `zoom meetings end <meetingId>` | End a live meeting |
| `zoom meetings list-registrants <meetingId>` | List registrants |
| `zoom meetings add-registrant <meetingId>` | Add a registrant |
| `zoom meetings summary <meetingId>` | Get AI Companion summary |

### recordings

| Command | Description |
|---------|-------------|
| `zoom recordings list [options]` | List cloud recordings (`--from`, `--to`) |
| `zoom recordings get <meetingId>` | Get recording files and download URLs |
| `zoom recordings transcript <meetingId>` | Get meeting transcript (VTT file from recording files) |
| `zoom recordings settings <meetingId>` | Get recording settings |
| `zoom recordings delete <meetingId>` | Move recordings to trash |
| `zoom recordings delete-file <meetingId> <recordingId>` | Delete a specific file |
| `zoom recordings recover <meetingId>` | Recover from trash |

Zoom has no standalone transcript API. `recordings transcript` calls `GET /meetings/{meetingId}/recordings?include_fields=download_access_token`, finds the `TRANSCRIPT` / `audio_transcript` file, and downloads that VTT via `download_url`.

### users

| Command | Description |
|---------|-------------|
| `zoom users list [options]` | List all users |
| `zoom users get <userId>` | Get user details (use `me` for yourself) |
| `zoom users create [options]` | Create a user |
| `zoom users update <userId> [options]` | Update user profile |
| `zoom users delete <userId>` | Delete or disassociate a user |
| `zoom users settings <userId>` | Get user settings |

### past-meetings

| Command | Description |
|---------|-------------|
| `zoom past-meetings get <uuid>` | Get past meeting instance details |
| `zoom past-meetings participants <uuid>` | Get participants with join/leave times |

### webinars

| Command | Description |
|---------|-------------|
| `zoom webinars list [options]` | List webinars |
| `zoom webinars get <id>` | Get webinar details |
| `zoom webinars create [options]` | Create a webinar |
| `zoom webinars update <id> [options]` | Update a webinar |
| `zoom webinars delete <id>` | Delete a webinar |
| `zoom webinars list-registrants <id>` | List registrants |
| `zoom webinars add-registrant <id>` | Add a registrant |
| `zoom webinars list-panelists <id>` | List panelists |
| `zoom webinars add-panelists <id>` | Add panelists |
| `zoom webinars list-polls <id>` | List polls |

### reports

| Command | Description |
|---------|-------------|
| `zoom reports daily` | Daily usage report (`--year`, `--month`) |
| `zoom reports users` | Active/inactive host report (`--from`, `--to`) |
| `zoom reports meeting <id>` | Meeting detail report |
| `zoom reports meeting-participants <id>` | Participant report |
| `zoom reports cloud-recording` | Cloud recording usage report |
| `zoom reports operation-logs` | Admin operation audit log |

### dashboard

| Command | Description |
|---------|-------------|
| `zoom dashboard meetings` | List meetings with quality metrics |
| `zoom dashboard meeting-detail <id>` | Meeting quality detail |
| `zoom dashboard meeting-participants <id>` | Participant quality metrics |
| `zoom dashboard quality` | Overall quality scores |

### chat

| Command | Description |
|---------|-------------|
| `zoom chat list-channels` | List channels |
| `zoom chat get-channel <id>` | Get channel details |
| `zoom chat create-channel` | Create a channel |
| `zoom chat list-messages` | List messages (`--to-channel` or `--to-contact`) |
| `zoom chat send-message` | Send a message |
| `zoom chat update-message <id>` | Update a message |
| `zoom chat delete-message <id>` | Delete a message |
| `zoom chat list-members <id>` | List channel members |

### groups

| Command | Description |
|---------|-------------|
| `zoom groups list` | List all groups |
| `zoom groups get <id>` | Get group details |
| `zoom groups create` | Create a group |
| `zoom groups update <id>` | Rename a group |
| `zoom groups delete <id>` | Delete a group |
| `zoom groups list-members <id>` | List members |
| `zoom groups add-members <id>` | Add members |

---

## Output

All commands output JSON to stdout, errors to stderr.

```bash
# Compact JSON (default — pipe-friendly)
zoom meetings list

# Indented JSON (human-readable)
zoom meetings list --pretty

# Select specific fields
zoom users list --fields id,email,first_name --pretty

# Suppress output (exit code only — for scripts)
zoom meetings delete 12345 --quiet
echo $?   # 0 = success, 1 = error
```

---

## Architecture

Each command is defined once as a `CommandDefinition` object — the same definition powers both the CLI (Commander.js) and MCP tool registration. Adding a new command means creating one file; both interfaces pick it up automatically.

```
src/
├── core/
│   ├── client.ts    # S2S OAuth with automatic token refresh
│   ├── handler.ts   # executeCommand() — routes fields to path/query/body
│   └── auth.ts      # flag > env > config resolution
├── commands/        # One file per command
└── mcp/server.ts    # Registers all CommandDefinitions as MCP tools
```

---

## License

MIT — [github.com/bcharleson/zoom-agent-cli](https://github.com/bcharleson/zoom-agent-cli)
