import { z } from 'zod';

export interface CliMapping {
  args?: Array<{
    field: string;
    name: string;
    required?: boolean;
  }>;
  options?: Array<{
    field: string;
    flags: string;
    description?: string;
  }>;
}

export interface CommandDefinition {
  /** Unique identifier, used as MCP tool name. e.g., "meetings_list" */
  name: string;

  /** CLI group. e.g., "meetings" */
  group: string;

  /** CLI subcommand name. e.g., "list" */
  subcommand: string;

  /** Human-readable description (used in --help AND MCP tool description) */
  description: string;

  /** Detailed examples for --help output */
  examples?: string[];

  /** Zod schema defining all inputs */
  inputSchema: z.ZodObject<any>;

  /** Maps Zod fields to CLI constructs (args and options) */
  cliMappings: CliMapping;

  /** HTTP method and path template */
  endpoint: {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
  };

  /** Where each input field goes in the HTTP request */
  fieldMappings: Record<string, 'path' | 'query' | 'body'>;

  /** Whether this is a paginated list endpoint */
  paginated?: boolean;

  /** The handler function */
  handler: (input: Record<string, any>, client: ZoomClient) => Promise<unknown>;
}

export interface ZoomClient {
  request<T>(options: {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  }): Promise<T>;

  get<T>(path: string, query?: Record<string, any>): Promise<T>;
  post<T>(path: string, body?: unknown, query?: Record<string, any>): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string, query?: Record<string, any>): Promise<T>;
}

export interface ZoomConfig {
  account_id: string;
  client_id: string;
  client_secret: string;
}

export interface GlobalOptions {
  accountId?: string;
  clientId?: string;
  clientSecret?: string;
  output?: 'json' | 'pretty';
  quiet?: boolean;
  fields?: string;
}
