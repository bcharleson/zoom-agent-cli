import { z } from 'zod';
import type { CommandDefinition } from '../../core/types.js';

interface RecordingFile {
  file_type?: string;
  recording_type?: string;
  download_url?: string;
}

interface RecordingsResponse {
  download_access_token?: string;
  recording_files?: RecordingFile[];
}

export const recordingsTranscriptCommand: CommandDefinition = {
  name: 'recordings_transcript',
  group: 'recordings',
  subcommand: 'transcript',
  description: 'Get the transcript for a meeting recording. Returns VTT-format transcript content.',
  examples: [
    'zoom recordings transcript 12345678901',
  ],

  inputSchema: z.object({
    meetingId: z.string().describe('Meeting ID or UUID'),
  }),

  cliMappings: {
    args: [{ field: 'meetingId', name: 'meetingId', required: true }],
  },

  // Zoom has no dedicated transcript endpoint. The transcript is delivered as a
  // TRANSCRIPT/VTT file inside the recordings response; fetch that file's
  // download_url (authenticated via download_access_token).
  endpoint: { method: 'GET', path: '/meetings/{meetingId}/recordings' },
  fieldMappings: { meetingId: 'path' },

  handler: async (input, client) => {
    const id = String(input.meetingId);
    // Zoom requires double-encoding when a UUID begins with '/' or contains '//'.
    const encoded =
      id.startsWith('/') || id.includes('//')
        ? encodeURIComponent(encodeURIComponent(id))
        : encodeURIComponent(id);

    const recordings = await client.get<RecordingsResponse>(
      `/meetings/${encoded}/recordings`,
      { include_fields: 'download_access_token', ttl: 3600 },
    );

    const transcriptFile = (recordings?.recording_files ?? []).find(
      (file) => file.file_type === 'TRANSCRIPT' || file.recording_type === 'audio_transcript',
    );

    if (!transcriptFile?.download_url) {
      return { transcript: null, message: 'No transcript file found for this recording.' };
    }

    const downloadUrl = recordings.download_access_token
      ? `${transcriptFile.download_url}?access_token=${recordings.download_access_token}`
      : transcriptFile.download_url;

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return { transcript: null, message: `Failed to download transcript (HTTP ${response.status}).` };
    }

    return { meetingId: id, transcript: await response.text() };
  },
};
