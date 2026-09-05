import { z } from 'zod';
import type { CommandDefinition, ZoomClient } from '../../core/types.js';

const TRANSCRIPT_DOWNLOAD_TIMEOUT_MS = 30_000;

interface RecordingFile {
  file_type?: string;
  recording_type?: string;
  download_url?: string;
}

interface RecordingsResponse {
  download_access_token?: string;
  recording_files?: RecordingFile[];
}

export type TranscriptResult =
  | { meetingId: string; transcript: string }
  | { transcript: null; message: string };

/**
 * Zoom requires double-encoding for meeting UUIDs that begin with '/' or contain '//'.
 * Numeric meeting IDs and ordinary UUIDs are encoded once.
 */
export function encodeMeetingPathId(meetingId: string): string {
  const encoded = encodeURIComponent(meetingId);
  if (meetingId.startsWith('/') || meetingId.includes('//')) {
    return encodeURIComponent(encoded);
  }
  return encoded;
}

function isTranscriptFile(file: RecordingFile): boolean {
  return file.file_type === 'TRANSCRIPT' || file.recording_type === 'audio_transcript';
}

function buildDownloadUrl(downloadUrl: string, accessToken?: string): string {
  if (!accessToken) return downloadUrl;
  const url = new URL(downloadUrl);
  url.searchParams.set('access_token', accessToken);
  return url.toString();
}

export async function fetchRecordingTranscript(
  meetingId: string,
  client: ZoomClient,
): Promise<TranscriptResult> {
  const recordings = await client.get<RecordingsResponse>(
    `/meetings/${encodeMeetingPathId(meetingId)}/recordings`,
    { include_fields: 'download_access_token' },
  );

  const transcriptFile = (recordings?.recording_files ?? []).find(isTranscriptFile);

  if (!transcriptFile?.download_url) {
    return { transcript: null, message: 'No transcript file found for this recording.' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TRANSCRIPT_DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(
      buildDownloadUrl(transcriptFile.download_url, recordings.download_access_token),
      { signal: controller.signal },
    );

    if (!response.ok) {
      return { transcript: null, message: `Failed to download transcript (HTTP ${response.status}).` };
    }

    return { meetingId, transcript: await response.text() };
  } finally {
    clearTimeout(timeoutId);
  }
}

export const recordingsTranscriptCommand: CommandDefinition = {
  name: 'recordings_transcript',
  group: 'recordings',
  subcommand: 'transcript',
  description:
    'Get the VTT transcript for a meeting recording. Downloads the TRANSCRIPT file from the meeting recording files — Zoom has no standalone transcript endpoint.',
  examples: [
    'zoom recordings transcript 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID. UUIDs that start with / or contain // are double-encoded automatically.'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  // Zoom has no GET /recordings/transcript. The transcript is a VTT file listed
  // on GET /meetings/{meetingId}/recordings (file_type=TRANSCRIPT).
  endpoint: { method: 'GET', path: '/meetings/{meetingId}/recordings' },
  fieldMappings: { meetingId: 'path' },

  handler: (input, client) => fetchRecordingTranscript(String(input.meetingId), client),
};
