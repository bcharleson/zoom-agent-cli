/**
 * Encode a Zoom path segment.
 *
 * Meeting/webinar UUIDs that begin with `/` or contain `//` must be
 * double-encoded or Zoom returns 404. Numeric IDs and ordinary UUIDs
 * are encoded once.
 *
 * @see https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/recordingGet
 */
export function encodeMeetingPathId(id: string): string {
  const encoded = encodeURIComponent(id);
  if (id.startsWith('/') || id.includes('//')) {
    return encodeURIComponent(encoded);
  }
  return encoded;
}
