import { describe, expect, it, vi } from 'vitest';
import type { ZoomClient } from '../../core/types.js';
import { listRecordingsRange, summarizeRecording, vttToText } from './shared.js';

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

describe('summarizeRecording', () => {
  it('flags transcript files', () => {
    const s = summarizeRecording({
      id: 1,
      uuid: 'abc',
      topic: 'Matchr weekly',
      recording_files: [{ file_type: 'MP4' }, { file_type: 'TRANSCRIPT' }],
    });
    expect(s.has_transcript).toBe(true);
    expect(s.topic).toBe('Matchr weekly');
  });
});

describe('vttToText', () => {
  it('strips WEBVTT timestamps', () => {
    const vtt = `WEBVTT

1
00:00:00.000 --> 00:00:02.000
Hello JC

2
00:00:02.000 --> 00:00:04.000
Karina replied
`;
    expect(vttToText(vtt)).toBe('Hello JC\nKarina replied');
  });
});

describe('listRecordingsRange', () => {
  it('pages until next_page_token is empty', async () => {
    const pages = [
      { meetings: [{ uuid: 'a', topic: 'One' }], next_page_token: 'n1' },
      { meetings: [{ uuid: 'b', topic: 'Two' }] },
    ];
    let i = 0;
    const get = vi.fn(async () => pages[Math.min(i++, pages.length - 1)]) as unknown as ZoomClient['get'];
    const client = mockClient(get);
    const from = new Date('2026-09-01T00:00:00Z');
    const to = new Date('2026-09-08T00:00:00Z');
    const recs = await listRecordingsRange(client, 'me', from, to);
    expect(recs.map((r) => r.uuid)).toEqual(['a', 'b']);
  });
});
