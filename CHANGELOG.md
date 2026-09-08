# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-09-08

Production-ready open-source release. **Upgrade from 0.1.x** with `npm install -g zoom-agent-cli@latest`.

### Fixed

- `zoom recordings transcript` and MCP `recordings_transcript` download the cloud recording VTT (`file_type=TRANSCRIPT` / `recording_type=audio_transcript`) instead of calling a nonexistent `GET /meetings/{id}/recordings/transcript` endpoint. npm `0.1.3` and earlier always 404'd even when a transcript file existed.
- Meeting and webinar UUIDs that start with `/` or contain `//` are double-encoded on every path-based command (not only transcript).

### Added

- `zoom-agent-cli` binary alias (in addition to `zoom`) so `npx zoom-agent-cli` works.
- Canonical MIT `LICENSE` at the repo root (GitHub licensee / SPDX MIT) plus this changelog and GitHub Actions CI.
- Documented npm / npx / GitHub install, clone-and-build, and a live transcript verification path.

### Changed

- Missing-auth errors list env vars, `zoom login`, and CLI flags.
- README, MCP tool list, and recordings command table include `recent` / `search`.
- README documents granular vs classic Marketplace scopes for transcript-only vs full CLI.

## [0.1.4] - unpublished

Shipped on GitHub `main` only (not published to npm).

- `recordings recent` and `recordings search` to find meetings that have a transcript.
- Transcript download via recording files (same approach as 0.2.0).

## [0.1.3] - 2026-09-05

Published to npm. Transcript command still targeted a nonexistent Zoom endpoint.

## [0.1.2] - 2026-03-19

- Align package name and docs to `zoom-agent-cli`.

## [0.1.1] - 2026-03-13

- README and repository metadata.

## [0.1.0] - 2026-03-13

- Initial release.
