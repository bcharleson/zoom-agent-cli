import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./config.js', () => ({
  loadConfig: vi.fn(),
}));

import { loadConfig } from './config.js';
import { MISSING_CREDENTIALS_MESSAGE, resolveCredentials } from './auth.js';
import { AuthError } from './errors.js';

const mockedLoadConfig = vi.mocked(loadConfig);

describe('resolveCredentials', () => {
  const envKeys = ['ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'] as const;

  afterEach(() => {
    for (const key of envKeys) delete process.env[key];
    mockedLoadConfig.mockReset();
  });

  it('prefers complete CLI flags', async () => {
    mockedLoadConfig.mockResolvedValue(null);
    const creds = await resolveCredentials({
      accountId: 'acct',
      clientId: 'id',
      clientSecret: 'secret',
    });
    expect(creds).toEqual({ accountId: 'acct', clientId: 'id', clientSecret: 'secret' });
  });

  it('rejects incomplete CLI flags', async () => {
    mockedLoadConfig.mockResolvedValue(null);
    await expect(resolveCredentials({ accountId: 'acct' })).rejects.toBeInstanceOf(AuthError);
    await expect(resolveCredentials({ accountId: 'acct' })).rejects.toThrow(/Incomplete CLI credentials/);
  });

  it('uses environment variables', async () => {
    mockedLoadConfig.mockResolvedValue(null);
    process.env.ZOOM_ACCOUNT_ID = 'env-acct';
    process.env.ZOOM_CLIENT_ID = 'env-id';
    process.env.ZOOM_CLIENT_SECRET = 'env-secret';

    await expect(resolveCredentials()).resolves.toEqual({
      accountId: 'env-acct',
      clientId: 'env-id',
      clientSecret: 'env-secret',
    });
  });

  it('throws an actionable error when nothing is configured', async () => {
    mockedLoadConfig.mockResolvedValue(null);
    await expect(resolveCredentials()).rejects.toBeInstanceOf(AuthError);
    await expect(resolveCredentials()).rejects.toThrow(MISSING_CREDENTIALS_MESSAGE);
  });
});
