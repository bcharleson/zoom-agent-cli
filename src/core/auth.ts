import { loadConfig } from './config.js';
import { AuthError } from './errors.js';

export interface ZoomCredentials {
  accountId: string;
  clientId: string;
  clientSecret: string;
}

export const MISSING_CREDENTIALS_MESSAGE =
  'No Zoom credentials found. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET; or run zoom login; or pass --account-id --client-id --client-secret. Docs: https://github.com/bcharleson/zoom-agent-cli#authentication';

export async function resolveCredentials(flags?: {
  accountId?: string;
  clientId?: string;
  clientSecret?: string;
}): Promise<ZoomCredentials> {
  const flagCount = [flags?.accountId, flags?.clientId, flags?.clientSecret].filter(Boolean).length;
  if (flagCount > 0 && flagCount < 3) {
    throw new AuthError(
      'Incomplete CLI credentials. Pass all three: --account-id, --client-id, --client-secret',
    );
  }

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

  throw new AuthError(MISSING_CREDENTIALS_MESSAGE);
}
