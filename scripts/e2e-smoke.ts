/**
 * Live Zoom E2E smoke against the real S2S API.
 *
 * Skips the entire suite (exit 0) when ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID /
 * ZOOM_CLIENT_SECRET are unset. Scope errors on optional commands are SKIP
 * (Marketplace app config), not FAIL (CLI bugs).
 *
 * Never prints secrets or full transcript bodies.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  defaultRecordingWindow,
  extractScopeHint,
  findMeetingWithTranscript,
  isScopeError,
  missingZoomEnv,
  parseJsonStdout,
  redactSecrets,
  summarizeTranscript,
  type RecordingMeetingLike,
  type StepVerdict,
} from '../src/e2e/smoke-helpers.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_TIMEOUT_MS = 45_000;
const TRANSCRIPT_TIMEOUT_MS = 90_000;
const MAX_RECORDING_PAGES = 5;

interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

interface StepResult {
  name: string;
  verdict: StepVerdict;
  detail: string;
}

function resolveCli(): { command: string; prefix: string[] } {
  const dist = join(ROOT, 'dist', 'index.js');
  if (existsSync(dist)) {
    return { command: process.execPath, prefix: [dist] };
  }
  const tsxCli = join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  if (existsSync(tsxCli)) {
    return { command: process.execPath, prefix: [tsxCli, join(ROOT, 'src', 'index.ts')] };
  }
  throw new Error('Neither dist/index.js nor tsx is available. Run bun/npm install, or npm run build.');
}

function runZoom(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS): Promise<CliResult> {
  const { command, prefix } = resolveCli();
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...prefix, ...args], {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Timed out after ${timeoutMs}ms: zoom ${args.join(' ')}`));
    }, timeoutMs);
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

function safeError(stderr: string): string {
  return redactSecrets(stderr.replace(/\s+/g, ' ').trim()).slice(0, 240);
}

function skipForScope(command: string, stderr: string): StepResult {
  const hint = extractScopeHint(stderr);
  const missing = hint ? ` missing ${hint}` : '';
  return {
    name: command,
    verdict: 'SKIP',
    detail: `S2S app is missing Marketplace scopes${missing} — not a CLI bug. Add the slug from the Zoom error and re-activate the app.`,
  };
}

function fail(command: string, detail: string): StepResult {
  return { name: command, verdict: 'FAIL', detail };
}

function pass(command: string, detail: string): StepResult {
  return { name: command, verdict: 'PASS', detail };
}

function skip(command: string, detail: string): StepResult {
  return { name: command, verdict: 'SKIP', detail };
}

function printStep(step: StepResult): void {
  console.log(`${step.verdict.padEnd(4)}  ${step.name} — ${step.detail}`);
}

async function runStatus(): Promise<StepResult> {
  const result = await runZoom(['status']);
  if (result.code === 0 && /connected as:/i.test(result.stdout)) {
    return pass('status', 'API token accepted (identity omitted)');
  }
  if (result.code === 0 && /credentials found/i.test(result.stdout)) {
    return fail('status', 'Credentials resolved but connectivity check did not report Connected as');
  }
  return fail('status', safeError(result.stderr || result.stdout) || 'status failed');
}

async function collectRecordings(
  userId: string,
  from: string,
  to: string,
): Promise<{ result: CliResult; meetings: RecordingMeetingLike[]; pages: number }> {
  const meetings: RecordingMeetingLike[] = [];
  let pages = 0;
  let nextPageToken: string | undefined;
  let lastResult: CliResult = { code: 0, stdout: '', stderr: '' };

  do {
    pages += 1;
    const args = [
      'recordings', 'list',
      '--user-id', userId,
      '--from', from,
      '--to', to,
      '--page-size', '300',
    ];
    if (nextPageToken) args.push('--next-page-token', nextPageToken);
    lastResult = await runZoom(args);
    if (lastResult.code !== 0) {
      return { result: lastResult, meetings, pages };
    }
    const body = parseJsonStdout(lastResult.stdout) as {
      meetings?: RecordingMeetingLike[];
      next_page_token?: string;
    } | undefined;
    meetings.push(...(body?.meetings ?? []));
    nextPageToken = body?.next_page_token || undefined;
  } while (nextPageToken && pages < MAX_RECORDING_PAGES && !findMeetingWithTranscript(meetings));

  return { result: lastResult, meetings, pages };
}

async function runRecordingsList(
  userId: string,
  from: string,
  to: string,
): Promise<{ step: StepResult; meetings: RecordingMeetingLike[] }> {
  let collected;
  try {
    collected = await collectRecordings(userId, from, to);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { step: fail('recordings list', redactSecrets(message)), meetings: [] };
  }

  if (collected.result.code !== 0) {
    const stderr = collected.result.stderr;
    if (isScopeError(stderr)) {
      return { step: skipForScope('recordings list', stderr), meetings: [] };
    }
    return { step: fail('recordings list', safeError(stderr) || 'recordings list failed'), meetings: [] };
  }

  return {
    step: pass(
      'recordings list',
      `${collected.meetings.length} meeting(s) in ${from}..${to} (${collected.pages} page(s))`,
    ),
    meetings: collected.meetings,
  };
}

async function runTranscript(meetings: RecordingMeetingLike[]): Promise<StepResult> {
  const forcedId = process.env.ZOOM_E2E_MEETING_ID?.trim();
  const match = forcedId
    ? { id: forcedId, uuid: undefined, topic: undefined }
    : findMeetingWithTranscript(meetings);

  if (!match?.id && !forcedId) {
    return skip(
      'recordings transcript',
      'No TRANSCRIPT/audio_transcript file in the recordings window — not a CLI bug',
    );
  }

  const meetingId = String(forcedId || match?.id);
  const result = await runZoom(['recordings', 'transcript', meetingId], TRANSCRIPT_TIMEOUT_MS);
  if (result.code !== 0) {
    if (isScopeError(result.stderr)) return skipForScope('recordings transcript', result.stderr);
    return fail('recordings transcript', safeError(result.stderr) || 'transcript command failed');
  }

  let payload: { transcript?: string | null; message?: string; meetingId?: string };
  try {
    payload = parseJsonStdout(result.stdout) as typeof payload;
  } catch {
    return fail('recordings transcript', 'stdout was not JSON (transcript body not printed)');
  }

  if (!payload?.transcript) {
    const message = payload?.message ?? 'No transcript returned';
    if (/no transcript file found/i.test(message)) {
      return skip('recordings transcript', `${message} for meeting ${meetingId}`);
    }
    return fail('recordings transcript', redactSecrets(message));
  }

  const { firstLine, charLength } = summarizeTranscript(payload.transcript);
  return pass(
    'recordings transcript',
    `meeting ${meetingId} WEBVTT first line ${JSON.stringify(firstLine)} (${charLength} chars)`,
  );
}

async function runMeetingsList(userId: string): Promise<StepResult> {
  const result = await runZoom(['meetings', 'list', '--user-id', userId, '--type', 'upcoming']);
  if (result.code !== 0) {
    if (isScopeError(result.stderr)) return skipForScope('meetings list', result.stderr);
    return fail('meetings list', safeError(result.stderr) || 'meetings list failed');
  }
  const body = parseJsonStdout(result.stdout) as { meetings?: unknown[] } | unknown[] | undefined;
  const count = Array.isArray(body) ? body.length : body?.meetings?.length ?? 0;
  return pass('meetings list', `${count} upcoming meeting(s)`);
}

async function runPastMeetings(meetings: RecordingMeetingLike[]): Promise<StepResult[]> {
  const uuid = meetings.find((meeting) => meeting.uuid)?.uuid;
  if (!uuid) {
    const detail = 'No meeting UUID from recordings list — skipped past-meetings get/participants';
    return [skip('past-meetings get', detail), skip('past-meetings participants', detail)];
  }

  const steps: StepResult[] = [];
  const getResult = await runZoom(['past-meetings', 'get', uuid]);
  if (getResult.code !== 0) {
    steps.push(
      isScopeError(getResult.stderr)
        ? skipForScope('past-meetings get', getResult.stderr)
        : fail('past-meetings get', safeError(getResult.stderr) || 'past-meetings get failed'),
    );
  } else {
    const body = parseJsonStdout(getResult.stdout) as { topic?: string; id?: string | number } | undefined;
    steps.push(pass('past-meetings get', `uuid present, id=${body?.id ?? 'n/a'}`));
  }

  const partResult = await runZoom(['past-meetings', 'participants', uuid]);
  if (partResult.code !== 0) {
    steps.push(
      isScopeError(partResult.stderr)
        ? skipForScope('past-meetings participants', partResult.stderr)
        : fail('past-meetings participants', safeError(partResult.stderr) || 'participants failed'),
    );
  } else {
    const body = parseJsonStdout(partResult.stdout) as { participants?: unknown[] } | undefined;
    steps.push(pass('past-meetings participants', `${body?.participants?.length ?? 0} participant(s)`));
  }
  return steps;
}

async function main(): Promise<void> {
  const missing = missingZoomEnv();
  if (missing.length > 0) {
    console.log(`SKIP  live E2E smoke — ${missing.join(', ')} not set`);
    process.exit(0);
  }

  const userId = process.env.ZOOM_E2E_USER_ID?.trim() || 'me';
  const window = {
    from: process.env.ZOOM_E2E_FROM?.trim() || defaultRecordingWindow().from,
    to: process.env.ZOOM_E2E_TO?.trim() || defaultRecordingWindow().to,
  };

  console.log('zoom-agent-cli live E2E smoke');
  console.log(`window ${window.from}..${window.to} user=${userId}`);
  console.log('');

  const steps: StepResult[] = [];

  const status = await runStatus();
  steps.push(status);
  printStep(status);
  if (status.verdict === 'FAIL') {
    finish(steps);
    return;
  }

  const recordings = await runRecordingsList(userId, window.from, window.to);
  steps.push(recordings.step);
  printStep(recordings.step);

  const transcript = await runTranscript(recordings.meetings);
  steps.push(transcript);
  printStep(transcript);

  const meetingsList = await runMeetingsList(userId);
  steps.push(meetingsList);
  printStep(meetingsList);

  for (const step of await runPastMeetings(recordings.meetings)) {
    steps.push(step);
    printStep(step);
  }

  finish(steps);
}

function finish(steps: StepResult[]): void {
  const counts = { PASS: 0, SKIP: 0, FAIL: 0 };
  for (const step of steps) counts[step.verdict] += 1;
  console.log('');
  console.log(`done  ${counts.PASS} passed, ${counts.SKIP} skipped, ${counts.FAIL} failed`);
  process.exit(counts.FAIL > 0 ? 1 : 0);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`FAIL  smoke runner — ${redactSecrets(message)}`);
  process.exit(1);
});
