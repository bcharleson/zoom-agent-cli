import { describe, expect, it } from 'vitest';
import { encodeMeetingPathId } from './path.js';

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
