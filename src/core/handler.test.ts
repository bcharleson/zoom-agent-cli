import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { executeCommand } from './handler.js';
import { encodeMeetingPathId } from './path.js';
import type { CommandDefinition, ZoomClient } from './types.js';

function mockClient(): ZoomClient & { request: ReturnType<typeof vi.fn> } {
  const request = vi.fn().mockResolvedValue({});
  return {
    request,
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

function pathCommand(path: string, field: string): CommandDefinition {
  return {
    name: 'test_cmd',
    group: 'test',
    subcommand: 'cmd',
    description: 'test',
    inputSchema: z.object({ [field]: z.string() }),
    cliMappings: { args: [{ field, name: field, required: true }] },
    endpoint: { method: 'GET', path },
    fieldMappings: { [field]: 'path' },
    handler: async () => ({}),
  };
}

describe('executeCommand path encoding', () => {
  it('double-encodes slash meeting UUIDs', async () => {
    const id = '/ajXp112WmuoKj4854875==';
    const client = mockClient();
    await executeCommand(pathCommand('/meetings/{meetingId}/recordings', 'meetingId'), { meetingId: id }, client);

    expect(client.request).toHaveBeenCalledWith({
      method: 'GET',
      path: `/meetings/${encodeMeetingPathId(id)}/recordings`,
      query: undefined,
      body: undefined,
    });
  });

  it('single-encodes numeric meeting IDs', async () => {
    const client = mockClient();
    await executeCommand(
      pathCommand('/meetings/{meetingId}/recordings', 'meetingId'),
      { meetingId: '12345678901' },
      client,
    );

    expect(client.request).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/meetings/12345678901/recordings' }),
    );
  });
});
