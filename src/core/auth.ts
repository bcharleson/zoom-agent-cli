import { loadConfig } from './config.js';
import { AuthError } from './errors.js';

export interface ZoomCredentials {
  accountId: string;
  clientId: string;
  clientSecret: string;
}

export async function resolveCredentials(flags?: {
  accountId?: string;
  clientId?: string;
  clientSecret?: string;
}): Promise<ZoomCredentials> {
  // 1. CLI flags take highest priority
  if (flags?.accountId && flags?.clientId && flags?.clientSecret) {
    return {
      accountId: flags.accountId,
      clientId: flags.clientId,
      clientSecret: flags.clientSecret,
    };
  }

  // 2. Environment variables
  const envAccountId = process.env.ZOOM_ACCOUNT_ID;
  const envClientId = process.env.ZOOM_CLIENT_ID;
  const envClientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (envAccountId && envClientId && envClientSecret) {
    return {
      accountId: envAccountId,
      clientId: envClientId,
      clientSecret: envClientSecret,
    };
  }

  // 3. Stored config from ~/.zoom-agent-cli/config.json
  const config = await loadConfig();
  if (config?.account_id && config?.client_id && config?.client_secret) {
    return {
      accountId: config.account_id,
      clientId: config.client_id,
      clientSecret: config.client_secret,
    };
  }

  throw new AuthError(
    'No Zoom credentials found. Set ZOOM_ACCOUNT_ID + ZOOM_CLIENT_ID + ZOOM_CLIENT_SECRET, or run: zoom login',
  );
}
