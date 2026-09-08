import { describe, expect, it } from 'vitest';
import { allCommands } from '../index.js';
import { recordingsTranscriptCommand } from './transcript.js';

describe('recordings_transcript MCP/CLI definition', () => {
  it('is registered with the MCP tool name recordings_transcript', () => {
    const cmd = allCommands.find((c) => c.name === 'recordings_transcript');
    expect(cmd).toBe(recordingsTranscriptCommand);
    expect(cmd?.group).toBe('recordings');
    expect(cmd?.subcommand).toBe('transcript');
    expect(cmd?.description).toMatch(/VTT|TRANSCRIPT/i);
    expect(cmd?.description).toMatch(/no standalone transcript endpoint/i);
  });

  it('requires meetingId and documents automatic UUID encoding', () => {
    const shape = recordingsTranscriptCommand.inputSchema.shape;
    expect(shape.meetingId).toBeDefined();
    expect(shape.meetingId.description).toMatch(/double-encoded/i);
  });
});
