/** Helpers for the live Zoom E2E smoke runner. Safe to unit-test without credentials. */

export const REQUIRED_ZOOM_ENV = [
  'ZOOM_ACCOUNT_ID',
  'ZOOM_CLIENT_ID',
  'ZOOM_CLIENT_SECRET',
] as const;

export type StepVerdict = 'PASS' | 'SKIP' | 'FAIL';

export interface RecordingFileLike {
  file_type?: string;
  recording_type?: string;
}

export interface RecordingMeetingLike {
  id?: string | number;
  uuid?: string;
  topic?: string;
  recording_files?: RecordingFileLike[];
}

export function missingZoomEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  return REQUIRED_ZOOM_ENV.filter((key) => !env[key]?.trim());
}

/**
 * True when Zoom rejected the call because the S2S app is missing a Marketplace
 * scope (app config), not because the CLI itself is broken.
 */
export function isScopeError(message: string): boolean {
  const text = message.toLowerCase();
  if (text.includes('does not contain scopes')) return true;
  if (text.includes('check your zoom app scopes')) return true;
  if (text.includes('insufficient scope')) return true;
  if (text.includes('missing scope')) return true;
  if (text.includes('invalid access token') && text.includes('scope')) return true;
  if (/\b4711\b/.test(message)) return true;
  if (/meeting:read:list_meetings/.test(message)) return true;
  if (/meeting:read:past_meeting/.test(message)) return true;
  if (/meeting:read:list_past_participants/.test(message)) return true;
  return false;
}

export function extractScopeHint(message: string): string | undefined {
  const match = message.match(/does not contain scopes:\s*\[([^\]]+)\]/i);
  const hint = match?.[1]?.trim();
  return hint || undefined;
}

export function isTranscriptFile(file: RecordingFileLike): boolean {
  return file.file_type === 'TRANSCRIPT' || file.recording_type === 'audio_transcript';
}

export function findMeetingWithTranscript(
  meetings: RecordingMeetingLike[],
): RecordingMeetingLike | undefined {
  return meetings.find((meeting) => (meeting.recording_files ?? []).some(isTranscriptFile));
}

export function summarizeTranscript(body: string): { firstLine: string; charLength: number } {
  const firstLine = (body.split(/\r?\n/, 1)[0] ?? '').slice(0, 80);
  return { firstLine, charLength: body.length };
}

export function redactSecrets(text: string, env: NodeJS.ProcessEnv = process.env): string {
  let out = text;
  for (const key of REQUIRED_ZOOM_ENV) {
    const value = env[key];
    if (value) {
      out = out.split(value).join(`<${key}>`);
    }
  }
  out = out.replace(/access_token=[^&\s"']+/gi, 'access_token=<redacted>');
  out = out.replace(/"download_access_token"\s*:\s*"[^"]+"/gi, '"download_access_token":"<redacted>"');
  return out;
}

export function isoDateUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Zoom recordings list allows at most one month; default to the last 30 UTC days. */
export function defaultRecordingWindow(now = new Date()): { from: string; to: string } {
  const to = isoDateUtc(now);
  const fromDate = new Date(now.getTime());
  fromDate.setUTCDate(fromDate.getUTCDate() - 29);
  return { from: isoDateUtc(fromDate), to };
}

export function parseJsonStdout(stdout: string): unknown {
  const trimmed = stdout.trim();
  if (!trimmed) return undefined;
  return JSON.parse(trimmed);
}
