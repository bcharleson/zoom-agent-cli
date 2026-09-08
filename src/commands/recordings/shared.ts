import type { ZoomClient } from '../../core/types.js';

export interface RecordingFile {
  file_type?: string;
  recording_type?: string;
  download_url?: string;
}

export interface CloudRecording {
  uuid?: string;
  id?: number | string;
  topic?: string;
  start_time?: string;
  duration?: number;
  host_email?: string;
  recording_files?: RecordingFile[];
}

interface RecordingsPage {
  meetings?: CloudRecording[];
  next_page_token?: string;
}

export function isTranscriptFile(file: RecordingFile): boolean {
  return file.file_type === 'TRANSCRIPT' || file.recording_type === 'audio_transcript';
}

export function summarizeRecording(rec: CloudRecording) {
  const files = rec.recording_files ?? [];
  return {
    id: rec.id,
    uuid: rec.uuid,
    topic: rec.topic ?? '',
    start_time: rec.start_time,
    duration: rec.duration,
    host_email: rec.host_email,
    has_transcript: files.some(isTranscriptFile),
    file_types: [...new Set(files.map((f) => f.file_type).filter(Boolean))],
  };
}

export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Zoom list-recordings range max is 1 month. Walk backward in 28-day windows. */
export async function listRecordingsRange(
  client: ZoomClient,
  userId: string,
  from: Date,
  to: Date,
): Promise<CloudRecording[]> {
  const out: CloudRecording[] = [];
  let windowEnd = new Date(to.getTime());
  const start = new Date(from.getTime());

  while (windowEnd > start) {
    const windowStart = new Date(Math.max(start.getTime(), windowEnd.getTime() - 28 * 86400000));
    let nextPageToken: string | undefined;

    do {
      const page = await client.get<RecordingsPage>(`/users/${encodeURIComponent(userId)}/recordings`, {
        from: ymd(windowStart),
        to: ymd(windowEnd),
        page_size: 300,
        next_page_token: nextPageToken,
      });
      out.push(...(page.meetings ?? []));
      nextPageToken = page.next_page_token || undefined;
    } while (nextPageToken);

    windowEnd = new Date(windowStart.getTime() - 86400000);
  }

  const seen = new Set<string>();
  return out.filter((r) => {
    const key = String(r.uuid || r.id || '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function vttToText(vtt: string): string {
  return vtt
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (t === 'WEBVTT') return false;
      if (/^\d+$/.test(t)) return false;
      if (t.includes('-->')) return false;
      if (t.startsWith('NOTE')) return false;
      return true;
    })
    .join('\n')
    .trim();
}
