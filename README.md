# zoom-agent-cli

CLI and MCP server for the Zoom API — built for humans and AI agents.

[![npm version](https://img.shields.io/npm/v/zoom-agent-cli.svg)](https://www.npmjs.com/package/zoom-agent-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/bcharleson/zoom-agent-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/bcharleson/zoom-agent-cli/actions/workflows/ci.yml)

**61 commands** across meetings, recordings, users, webinars, reports, dashboard, chat, and groups. Every command is a CLI subcommand and an MCP tool — same schema, same auth, one codebase.

> **Upgrading from 0.1.x?** Run `npm install -g zoom-agent-cli@latest`. npm `0.1.3` and earlier called a nonexistent Zoom transcript endpoint and 404'd even when a VTT existed. `0.2.0` downloads the `TRANSCRIPT` file from `GET /meetings/{id}/recordings`. See [CHANGELOG.md](CHANGELOG.md).

---

## Install

**npm (global)** — Node 18+:

```bash
npm install -g zoom-agent-cli
zoom --help
zoom --version
```

**npx** (no install):

```bash
npx zoom-agent-cli --help
npx zoom-agent-cli status
```

**From GitHub** (latest `main`, including unreleased fixes):

```bash
npm install -g github:bcharleson/zoom-agent-cli
```

**Clone and run** (fork / local development):

```bash
git clone https://github.com/bcharleson/zoom-agent-cli.git
cd zoom-agent-cli
npm install
npm run build
node dist/index.js --help
# optional: npm link   # puts `zoom` and `zoom-agent-cli` on PATH
```

---

## Zoom Server-to-Server OAuth

This tool uses **Server-to-Server OAuth** — no browser login. You exchange account credentials for a short-lived access token on every request.

### Create the app

1. Go to [marketplace.zoom.us](https://marketplace.zoom.us) → **Develop** → **Build App**
2. Choose **Server-to-Server OAuth**
3. Name it anything (e.g. `zoom-agent-cli`)
4. Under **App Credentials**, copy **Account ID**, **Client ID**, and **Client Secret**

### Add scopes

In the app **Scopes** tab, add what you need. Transcripts require `recording:read:admin`.

| Group | Required scopes |
|-------|-----------------|
| **meetings** | `meeting:read:admin` `meeting:write:admin` |
| **recordings** (list, get, **transcript**) | `recording:read:admin` `recording:write:admin` |
| **users** | `user:read:admin` `user:write:admin` |
| **webinars** | `webinar:read:admin` `webinar:write:admin` |
| **reports** | `report:read:admin` |
| **dashboard** | `dashboard:read:admin` `dashboard_meetings:read:admin` |
| **chat** | `chat_channel:read:admin` `chat_channel:write:admin` `chat_message:read:admin` `chat_message:write:admin` |
| **groups** | `group:read:admin` `group:write:admin` |
| **AI summary** | `meeting_summary:read:admin` |

For a read-only agent, add only the `:read:admin` variants. Click **Activate your app** — tokens are not issued until the app is active.

---

## Authentication

Credentials are resolved in this order: CLI flags → environment → `zoom login` config.

### Environment variables (recommended for agents)

```bash
export ZOOM_ACCOUNT_ID="your-account-id"
export ZOOM_CLIENT_ID="your-client-id"
export ZOOM_CLIENT_SECRET="your-client-secret"
```

A committed [`.env.example`](.env.example) lists the names. Copy it to `.env` locally — **never commit real values**.

### Interactive login (local CLI)

```bash
zoom login    # writes ~/.zoom-agent-cli/config.json (mode 0600)
zoom logout   # deletes that file
```

### Per-command flags

```bash
zoom meetings list --account-id "..." --client-id "..." --client-secret "..."
```

If credentials are missing, the CLI exits `1` and prints how to set them.

---

## Quickstart

```bash
zoom status
zoom meetings list --user-id me --type upcoming --pretty
```

### Recordings and transcripts

Zoom has **no** `GET /meetings/{id}/recordings/transcript` endpoint. This CLI lists recording files, finds `file_type=TRANSCRIPT` (or `recording_type=audio_transcript`), and downloads that VTT with `download_access_token`. Meeting UUIDs that start with `/` or contain `//` are double-encoded automatically.

```bash
# Find recent recordings that have a transcript
zoom recordings recent --days 14 --pretty

# Or search by topic
zoom recordings search standup --days 90 --pretty

# Pull WEBVTT + plain text for a meeting ID or UUID
zoom recordings transcript <meetingId> --pretty
```

A successful pull looks like:

```json
{
  "meetingId": "12345678901",
  "transcript": "WEBVTT\n\n1\n00:00:00.000 --> 00:00:02.000\nHello\n",
  "text": "Hello"
}
```

If the meeting has no cloud transcript file, you get `{ "transcript": null, "message": "No transcript file found for this recording." }`.

**Live verification** (needs a real S2S app; not run in CI):

1. `zoom status` — connection succeeds.
2. `zoom recordings recent --days 14 --pretty` — at least one item with `"has_transcript": true`.
3. `zoom recordings transcript <id>` — `transcript` starts with `WEBVTT`.

Unit tests mock the Zoom API and the VTT download (`npm test`).

---

## CLI

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
  recordings              Manage recordings (9 commands)
  users                   Manage users (6 commands)
  past-meetings           Access past meeting data (2 commands)
  webinars                Manage webinars (10 commands)
  reports                 Usage and audit reports (6 commands)
  dashboard               Quality metrics (4 commands)
  chat                    Team Chat channels and messages (8 commands)
  groups                  User groups (7 commands)
```

```bash
zoom meetings create \
  --topic "Sprint Review" \
  --type 2 \
  --duration 60 \
  --start-time "2026-03-15T14:00:00Z" \
  --timezone "America/New_York"

zoom recordings get <meeting-id> --include-fields download_access_token
zoom meetings summary <meeting-uuid>
zoom past-meetings participants <meeting-uuid>
zoom chat send-message --to-channel <channel-id> --message "Deployment complete"
zoom reports daily --year 2026 --month 3
zoom users list --fields id,email,first_name,last_name --pretty
```

---

## MCP server

```bash
zoom mcp
# or: npx zoom-agent-cli mcp
```

### Claude Code / Claude Desktop

`~/.claude.json` (or your MCP config). Prefer env vars over checking secrets into git.

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

If installed globally, `"command": "zoom"` and `"args": ["mcp"]`.

### Grok

```toml
[mcp_servers.zoom]
command = "zoom"
args = ["mcp"]
enabled = true
```

### Tools

All **61** tools are `{group}_{subcommand}`. Transcript:

| Tool | Description |
|------|-------------|
| `recordings_transcript` | Download the meeting VTT from recording files |
| `recordings_recent` | Last N days of recordings with `has_transcript` |
| `recordings_search` | Search recording topics, then pull VTT by id |
| `recordings_get` | Recording files and download URLs |
| `meetings_list` | List meetings for a user |
| `meetings_get` | Meeting details |
| `meetings_summary` | AI Companion summary |

Run `zoom mcp` (with credentials) to register the full set.

---

## Command reference

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
| `zoom recordings transcript <meetingId>` | Download VTT from the `TRANSCRIPT` recording file |
| `zoom recordings recent [options]` | Last N days with `has_transcript` (default 14) |
| `zoom recordings search <keyword>` | Search topics (default 90 days) |
| `zoom recordings settings <meetingId>` | Get recording settings |
| `zoom recordings delete <meetingId>` | Move recordings to trash |
| `zoom recordings delete-file <meetingId> <recordingId>` | Delete a specific file |
| `zoom recordings recover <meetingId>` | Recover from trash |

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
| `zoom webinars update <id>` | Update a webinar |
| `zoom webinars delete <id>` | Delete a webinar |
| `zoom webinars list-registrants <id>` | List registrants |
| `zoom webinars add-registrant <id>` | Add registrant |
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

JSON on stdout, errors on stderr.

```bash
zoom meetings list
zoom meetings list --pretty
zoom users list --fields id,email,first_name --pretty
zoom meetings delete 12345 --quiet
echo $?   # 0 = success, 1 = error
```

---

## Architecture

Each command is one `CommandDefinition` — CLI (Commander.js) and MCP share it. Add `src/commands/{group}/{subcommand}.ts` and register it in `src/commands/index.ts`.

```
src/
├── core/
│   ├── client.ts    # S2S OAuth, token refresh, retries
│   ├── handler.ts   # executeCommand() — path/query/body + UUID encoding
│   └── auth.ts      # flag > env > config
├── commands/        # One file per command
└── mcp/server.ts    # Registers all CommandDefinitions as MCP tools
```

---

## Contributing

1. Fork or clone this repo. Node 18+ required.
2. `npm install && npm run typecheck && npm test && npm run build`
3. Follow the `CommandDefinition` pattern. Prefer a custom handler only when the Zoom request is non-standard (the transcript command is the main example).
4. Do not add live Zoom credentials to tests or CI. Mock `ZoomClient` and `fetch`.
5. Open a PR against `main`. CI must stay green.

---

## Security

- **Never commit** `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `.env`, or `~/.zoom-agent-cli/config.json`.
- Server-to-Server OAuth is account-wide. Treat those three values like production secrets.
- `recordings get --include-fields download_access_token` and VTT download URLs are short-lived credentials — do not paste them into tickets or logs.
- Report vulnerabilities privately to the maintainer via GitHub security advisories on [bcharleson/zoom-agent-cli](https://github.com/bcharleson/zoom-agent-cli).

---

## License

MIT — see [LICENSE](LICENSE).
