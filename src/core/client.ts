import type { ZoomClient as IZoomClient } from './types.js';
import type { ZoomCredentials } from './auth.js';
import {
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  ZoomError,
} from './errors.js';

const BASE_URL = 'https://api.zoom.us/v2';
const TOKEN_URL = 'https://zoom.us/oauth/token';
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 30_000;
const WRITE_TIMEOUT = 15_000;
const VERSION = '0.1.0';

// Buffer before expiry to avoid race conditions (5 minutes)
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

interface ClientOptions {
  credentials: ZoomCredentials;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Zoom API client with automatic Server-to-Server OAuth token management.
 *
 * Zoom's S2S OAuth uses the "account_credentials" grant type:
 * - POST https://zoom.us/oauth/token
 * - grant_type=account_credentials&account_id=XXX
 * - Basic auth header with client_id:client_secret
 * - Returns access_token with ~1hr TTL
 *
 * This client transparently handles token acquisition and refresh.
 */
export class ZoomClient implements IZoomClient {
  private credentials: ZoomCredentials;
  private baseUrl: string;
  private maxRetries: number;
  private timeout: number;

  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private tokenPromise: Promise<string> | null = null;

  constructor(options: ClientOptions) {
    this.credentials = options.credentials;
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.maxRetries = options.maxRetries ?? MAX_RETRIES;
    this.timeout = options.timeout ?? REQUEST_TIMEOUT;
  }

  /**
   * Get a valid access token, refreshing if needed.
   * Uses a shared promise to prevent concurrent token requests.
   */
  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    // Deduplicate concurrent token requests
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchToken();
    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async fetchToken(): Promise<string> {
    const basicAuth = Buffer.from(
      `${this.credentials.clientId}:${this.credentials.clientSecret}`,
    ).toString('base64');

    const params = new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: this.credentials.accountId,
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new AuthError(
        `Failed to obtain Zoom access token: ${response.status} ${errorBody}`,
      );
    }

    const data = (await response.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000 - TOKEN_EXPIRY_BUFFER_MS;

    return this.accessToken;
  }

  async request<T>(options: {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  }): Promise<T> {
    const url = new URL(this.baseUrl + options.path);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    let lastError: Error | undefined;
    const isWrite = options.method !== 'GET';
    const effectiveTimeout = isWrite ? Math.min(this.timeout, WRITE_TIMEOUT) : this.timeout;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const token = await this.getToken();

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'User-Agent': `zoom-cli/${VERSION}`,
        };

        if (options.body !== undefined) {
          headers['Content-Type'] = 'application/json';
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);

        const response = await fetch(url.toString(), {
          method: options.method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // 204 No Content (common for DELETE/PUT status operations)
          if (response.status === 204) return undefined as T;
          const text = await response.text();
          if (!text) return undefined as T;
          return JSON.parse(text) as T;
        }

        const errorBody = await response.text().catch(() => '');
        let errorMessage: string;
        try {
          const parsed = JSON.parse(errorBody);
          // Zoom returns { code: number, message: string } on errors
          errorMessage = parsed.message || parsed.error || errorBody;
        } catch {
          errorMessage = errorBody || response.statusText;
        }

        switch (response.status) {
          case 401: {
            // Token may have expired — force refresh and retry once
            this.accessToken = null;
            this.tokenExpiresAt = 0;
            if (attempt < this.maxRetries) {
              lastError = new AuthError(errorMessage);
              continue;
            }
            throw new AuthError(errorMessage);
          }
          case 403:
            throw new AuthError(`Forbidden: ${errorMessage}. Check your Zoom app scopes.`);
          case 404:
            throw new NotFoundError(errorMessage);
          case 400:
          case 422:
            throw new ValidationError(errorMessage);
          case 429: {
            const retryAfter = parseInt(response.headers.get('retry-after') ?? '', 10);
            const err = new RateLimitError(errorMessage, isNaN(retryAfter) ? undefined : retryAfter);
            if (attempt < this.maxRetries) {
              const delay = err.retryAfter
                ? err.retryAfter * 1000
                : Math.min(1000 * Math.pow(2, attempt), 10_000);
              await sleep(delay);
              lastError = err;
              continue;
            }
            throw err;
          }
          default:
            if (response.status >= 500) {
              const err = new ServerError(errorMessage, response.status);
              if (attempt < this.maxRetries) {
                await sleep(Math.min(1000 * Math.pow(2, attempt), 10_000));
                lastError = err;
                continue;
              }
              throw err;
            }
            throw new ZoomError(errorMessage, 'API_ERROR', response.status);
        }
      } catch (error) {
        if (error instanceof ZoomError) throw error;

        const isAbort =
          error instanceof Error &&
          (error.name === 'AbortError' || String(error.message).includes('aborted'));

        if (isAbort) {
          lastError = new ZoomError(
            `Request timed out after ${effectiveTimeout / 1000}s: ${options.method} ${options.path}`,
            'TIMEOUT',
          );
          if (!isWrite && attempt < this.maxRetries) {
            await sleep(Math.min(1000 * Math.pow(2, attempt), 10_000));
            continue;
          }
          throw lastError;
        }

        if (error instanceof TypeError && String(error.message).includes('fetch')) {
          throw new ZoomError(`Network error: ${error.message}`, 'NETWORK_ERROR');
        }

        throw error;
      }
    }

    throw lastError ?? new ZoomError('Request failed after retries', 'MAX_RETRIES');
  }

  async get<T>(path: string, query?: Record<string, any>): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }

  async post<T>(path: string, body?: unknown, query?: Record<string, any>): Promise<T> {
    return this.request<T>({ method: 'POST', path, query, body });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  async delete<T>(path: string, query?: Record<string, any>): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, query });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
