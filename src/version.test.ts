import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { VERSION } from './version.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('VERSION', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    version: string;
    files: string[];
    bin: Record<string, string>;
    license: string;
    repository: { url: string };
  };

  it('matches package.json', () => {
    expect(pkg.version).toBe(VERSION);
  });

  it('publishes the OSS files whitelist and both bin names', () => {
    expect(pkg.license).toBe('MIT');
    expect(pkg.repository.url).toContain('github.com/bcharleson/zoom-agent-cli');
    expect(pkg.files).toEqual(expect.arrayContaining(['dist', 'README.md', 'LICENSE', 'CHANGELOG.md', 'AGENTS.md']));
    expect(pkg.files).not.toEqual(expect.arrayContaining(['.env', 'config.json', 'node_modules']));
    expect(pkg.bin.zoom).toBe('dist/index.js');
    expect(pkg.bin['zoom-agent-cli']).toBe('dist/index.js');
  });

  it('ships a root LICENSE GitHub licensee can detect as MIT', () => {
    const license = readFileSync(join(root, 'LICENSE'), 'utf8');
    expect(license.startsWith('MIT License\n')).toBe(true);
    expect(license).toContain('Copyright (c)');
    expect(license).toContain('Permission is hereby granted, free of charge, to any person obtaining a copy');
    expect(license).toContain('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND');
    expect(pkg.license).toBe('MIT');
  });
});
