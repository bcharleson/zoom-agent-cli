import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ZoomClient } from '../../core/types.js';
import {
  encodeMeetingPathId,
  fetchRecordingTranscript,
} from './transcript.js';

function mockClient(impl: ZoomClient['get']): ZoomClient {
  return {
    get: impl,
    request: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

describe('encodeMeetingPathId', () => {
  it('encodes a numeric meeting ID once', () => {
    expect(encodeMeetingPathId('12345678901')).toBe('12345678901');
  });

  it('encodes an ordinary UUID once', () => {
    const id = 'abcDEF123+/=';
    expect(encodeMeetingPathId(id)).toBe(encodeURIComponent(id));
  });

  it('double-encodes a UUID that starts with /', () => {
    const id = '/ajXp112WmuoKj4854875==';
    expect(encodeMeetingPathId(id)).toBe(encodeURIComponent(encodeURIComponent(id)));
  });

  it('double-encodes a UUID that contains //', () => {
    const id = 'abc//def+ghi==';
    expect(encodeMeetingPathId(id)).toBe(encodeURIComponent(encodeURIComponent(id)));
  });
});

describe('fetchRecordingTranscript', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloads VTT from the TRANSCRIPT recording file', async () => {
    const get = vi.fn().mockResolvedValue({
      download_access_token: 'tok-123',
      recording_files: [
        { file_type: 'MP4', download_url: 'https://zoom.example/video.mp4' },
        { file_type: 'TRANSCRIPT', download_url: 'https://zoom.example/rec/transcript.vtt' },
      ],
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response('WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nHello', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchRecordingTranscript('12345678901', mockClient(get));

    expect(get).toHaveBeenCalledWith('/meetings/12345678901/recordings', {
      include_fields: 'download_access_token',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requested = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requested.origin + requested.pathname).toBe('https://zoom.example/rec/transcript.vtt');
    expect(requested.searchParams.get('access_token')).toBe('tok-123');
    expect(result).toEqual({
      meetingId: '12345678901',
      transcript: 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nHello',
      text: 'Hello',
    });
  });

  it('matches recording_type=audio_transcript when file_type is absent', async () => {
    const get = vi.fn().mockResolvedValue({
      recording_files: [
        { recording_type: 'audio_transcript', download_url: 'https://zoom.example/audio.vtt' },
      ],
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('WEBVTT', { status: 200 })));

    const result = await fetchRecordingTranscript('99', mockClient(get));

    expect(result).toEqual({ meetingId: '99', transcript: 'WEBVTT', text: '' });
  });

  it('returns a null transcript when no transcript file is present', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchRecordingTranscript(
      '123',
      mockClient(vi.fn().mockResolvedValue({
        recording_files: [{ file_type: 'MP4', download_url: 'https://zoom.example/video.mp4' }],
      })),
    );

    expect(result).toEqual({
      transcript: null,
      message: 'No transcript file found for this recording.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns a null transcript when the VTT download fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('gone', { status: 404 })));

    const result = await fetchRecordingTranscript(
      '123',
      mockClient(vi.fn().mockResolvedValue({
        recording_files: [{ file_type: 'TRANSCRIPT', download_url: 'https://zoom.example/missing.vtt' }],
      })),
    );

    expect(result).toEqual({
      transcript: null,
      message: 'Failed to download transcript (HTTP 404).',
    });
  });

  it('double-encodes slash UUIDs in the recordings path', async () => {
    const id = '/ajXp112WmuoKj4854875==';
    const get = vi.fn().mockResolvedValue({ recording_files: [] });

    await fetchRecordingTranscript(id, mockClient(get));

    expect(get).toHaveBeenCalledWith(
      `/meetings/${encodeURIComponent(encodeURIComponent(id))}/recordings`,
      { include_fields: 'download_access_token' },
    );
  });

  it('returns a timeout message when the VTT download is aborted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })),
    );

    const result = await fetchRecordingTranscript(
      '123',
      mockClient(vi.fn().mockResolvedValue({
        recording_files: [{ file_type: 'TRANSCRIPT', download_url: 'https://zoom.example/slow.vtt' }],
      })),
    );

    expect(result).toEqual({
      transcript: null,
      message: 'Transcript download timed out after 30s.',
    });
  });

  it('preserves existing query params on download_url when adding the token', async () => {
    const get = vi.fn().mockResolvedValue({
      download_access_token: 'tok-xyz',
      recording_files: [
        { file_type: 'TRANSCRIPT', download_url: 'https://zoom.example/rec/t.vtt?pwd=abc' },
      ],
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response('WEBVTT', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecordingTranscript('1', mockClient(get));

    const requested = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requested.searchParams.get('pwd')).toBe('abc');
    expect(requested.searchParams.get('access_token')).toBe('tok-xyz');
  });
});
