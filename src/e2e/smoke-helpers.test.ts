import { describe, expect, it } from 'vitest';
import {
  defaultRecordingWindow,
  extractScopeHint,
  findMeetingWithTranscript,
  isScopeError,
  missingZoomEnv,
  redactSecrets,
  summarizeTranscript,
} from './smoke-helpers.js';

describe('missingZoomEnv', () => {
  it('returns every unset Zoom credential key', () => {
    expect(missingZoomEnv({})).toEqual([
      'ZOOM_ACCOUNT_ID',
      'ZOOM_CLIENT_ID',
      'ZOOM_CLIENT_SECRET',
    ]);
  });

  it('treats blank values as missing', () => {
    expect(
      missingZoomEnv({
        ZOOM_ACCOUNT_ID: 'acct',
        ZOOM_CLIENT_ID: '   ',
        ZOOM_CLIENT_SECRET: 'secret',
      }),
    ).toEqual(['ZOOM_CLIENT_ID']);
  });

  it('returns empty when all three are set', () => {
    expect(
      missingZoomEnv({
        ZOOM_ACCOUNT_ID: 'acct',
        ZOOM_CLIENT_ID: 'client',
        ZOOM_CLIENT_SECRET: 'secret',
      }),
    ).toEqual([]);
  });
});

describe('isScopeError', () => {
  it('classifies Zoom missing-scope payloads as app-config, not CLI bugs', () => {
    expect(
      isScopeError('Invalid access token, does not contain scopes:[meeting:read:list_meetings]'),
    ).toBe(true);
    expect(
      isScopeError('Forbidden: Access denied. Check your Zoom app scopes.'),
    ).toBe(true);
    expect(
      isScopeError('Invalid access token, does not contain scopes:[meeting:read:past_meeting:admin]'),
    ).toBe(true);
    expect(isScopeError('Zoom error 4711')).toBe(true);
  });

  it('does not treat credential or not-found errors as scope skips', () => {
    expect(isScopeError('Invalid access token.')).toBe(false);
    expect(isScopeError('Meeting does not exist.')).toBe(false);
    expect(isScopeError('Network error: getaddrinfo ENOTFOUND api.zoom.us')).toBe(false);
    expect(isScopeError('Failed to obtain Zoom access token: 401 {"reason":"invalid_client"}')).toBe(false);
  });
});

describe('extractScopeHint', () => {
  it('pulls the slug list from a Zoom scope error', () => {
    expect(
      extractScopeHint('Invalid access token, does not contain scopes:[meeting:read:list_meetings]'),
    ).toBe('meeting:read:list_meetings');
  });

  it('returns undefined when the message has no scope list', () => {
    expect(extractScopeHint('Meeting does not exist.')).toBeUndefined();
  });
});

describe('findMeetingWithTranscript', () => {
  it('picks the first meeting with a TRANSCRIPT file', () => {
    const found = findMeetingWithTranscript([
      { id: 1, recording_files: [{ file_type: 'MP4' }] },
      { id: 2, uuid: 'abc', recording_files: [{ file_type: 'TRANSCRIPT' }] },
      { id: 3, recording_files: [{ file_type: 'TRANSCRIPT' }] },
    ]);
    expect(found?.id).toBe(2);
    expect(found?.uuid).toBe('abc');
  });

  it('matches recording_type=audio_transcript', () => {
    const found = findMeetingWithTranscript([
      { id: 9, recording_files: [{ recording_type: 'audio_transcript' }] },
    ]);
    expect(found?.id).toBe(9);
  });

  it('returns undefined when no transcript file is present', () => {
    expect(
      findMeetingWithTranscript([{ id: 1, recording_files: [{ file_type: 'MP4' }] }]),
    ).toBeUndefined();
  });
});

describe('summarizeTranscript', () => {
  it('returns only the first line and character length', () => {
    const vtt = 'WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nsecret spoken words';
    expect(summarizeTranscript(vtt)).toEqual({ firstLine: 'WEBVTT', charLength: vtt.length });
  });
});

describe('redactSecrets', () => {
  it('replaces credential values and download tokens', () => {
    const redacted = redactSecrets(
      'token=abc&access_token=super-secret "download_access_token":"tok-123" acct-id client-id client-secret',
      {
        ZOOM_ACCOUNT_ID: 'acct-id',
        ZOOM_CLIENT_ID: 'client-id',
        ZOOM_CLIENT_SECRET: 'client-secret',
      },
    );
    expect(redacted).toContain('<ZOOM_ACCOUNT_ID>');
    expect(redacted).toContain('<ZOOM_CLIENT_ID>');
    expect(redacted).toContain('<ZOOM_CLIENT_SECRET>');
    expect(redacted).toContain('access_token=<redacted>');
    expect(redacted).toContain('"download_access_token":"<redacted>"');
    expect(redacted).not.toContain('client-secret');
    expect(redacted).not.toContain('super-secret');
    expect(redacted).not.toContain('tok-123');
  });
});

describe('defaultRecordingWindow', () => {
  it('spans 30 UTC days inclusive of today', () => {
    expect(defaultRecordingWindow(new Date('2026-09-05T18:00:00.000Z'))).toEqual({
      from: '2026-08-07',
      to: '2026-09-05',
    });
  });
});
