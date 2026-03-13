# zoom-cli — Developer Guide

## Architecture

Dual CLI + MCP server from a single codebase using the `CommandDefinition` pattern.

**Single source of truth:** Each command is defined once as a `CommandDefinition` object in `src/commands/{group}/{subcommand}.ts`. The same definition powers both the CLI (Commander.js) and MCP tool registration.

### Directory Structure

```
src/
├── index.ts                    # CLI entry point (Commander.js)
├── mcp.ts                      # Direct MCP entry point
├── core/
│   ├── types.ts               # CommandDefinition, ZoomClient interfaces
│   ├── client.ts              # HTTP client (S2S OAuth, auto token refresh, retry)
│   ├── handler.ts             # executeCommand() — builds HTTP requests from definitions
│   ├── auth.ts                # Credential resolution (flag > env > config)
│   ├── config.ts              # ~/.zoom-cli/config.json manager
│   ├── output.ts              # JSON formatting, --fields, --quiet
│   └── errors.ts              # Typed error classes
├── commands/
│   ├── index.ts               # allCommands array + registerAllCommands()
│   ├── auth/                  # login, logout, status (special)
│   ├── mcp/                   # MCP server command
│   ├── meetings/              # 9 commands
│   ├── recordings/            # 7 commands
│   ├── users/                 # 6 commands
│   ├── past-meetings/         # 2 commands
│   ├── webinars/              # 10 commands
│   ├── reports/               # 6 commands
│   ├── dashboard/             # 4 commands
│   ├── chat/                  # 8 commands
│   └── groups/                # 7 commands
└── mcp/
    └── server.ts              # MCP server registration
```

### Key Patterns

- **executeCommand():** Standard REST endpoints use `executeCommand(cmdDef, input, client)` which routes fields to path/query/body based on `fieldMappings`.
- **Custom handlers:** Non-standard endpoints (e.g., user creation wraps body in `{action, user_info}`) use custom handler functions.
- **Auth:** Zoom Server-to-Server OAuth with automatic token refresh. Client caches tokens and auto-refreshes on expiry or 401.

### Adding a New Command

1. Create `src/commands/{group}/{subcommand}.ts`
2. Define a `CommandDefinition` with inputSchema, endpoint, fieldMappings, handler
3. Import and add to `allCommands[]` in `src/commands/index.ts`
4. Both CLI and MCP automatically pick it up

### Build

```bash
bun install
npx tsup           # builds dist/index.js (CLI) + dist/mcp.js (MCP)
npx tsc --noEmit   # typecheck
```

### Auth (S2S OAuth)

Zoom uses Server-to-Server OAuth (account credentials grant):
- POST `https://zoom.us/oauth/token` with `grant_type=account_credentials`
- Basic auth with `client_id:client_secret`
- Returns ~1hr access token (auto-refreshed by ZoomClient)

Required env vars: `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`

### Required Zoom App Scopes

Configure these in your Zoom Marketplace Server-to-Server OAuth app:

**Meetings:** `meeting:read:admin`, `meeting:write:admin`
**Recordings:** `recording:read:admin`, `recording:write:admin`
**Users:** `user:read:admin`, `user:write:admin`
**Reports:** `report:read:admin`
**Dashboard:** `dashboard_meetings:read:admin`, `dashboard:read:admin`
**Webinars:** `webinar:read:admin`, `webinar:write:admin`
**Chat:** `chat_channel:read:admin`, `chat_channel:write:admin`, `chat_message:read:admin`, `chat_message:write:admin`
**Groups:** `group:read:admin`, `group:write:admin`
**AI Companion:** `meeting_summary:read:admin`
