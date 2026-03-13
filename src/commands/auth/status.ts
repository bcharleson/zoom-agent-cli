import { Command } from 'commander';
import { resolveCredentials } from '../../core/auth.js';
import { ZoomClient } from '../../core/client.js';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Check authentication status and test API connectivity')
    .action(async () => {
      try {
        const credentials = await resolveCredentials();
        console.log('Credentials found:');
        console.log(`  Account ID: ${credentials.accountId.slice(0, 8)}...`);
        console.log(`  Client ID:  ${credentials.clientId.slice(0, 8)}...`);
        console.log('  Client Secret: ****');

        console.log('\nTesting API connection...');
        const client = new ZoomClient({ credentials });
        const user = await client.get<{ id: string; email: string; first_name: string; last_name: string }>('/users/me');
        console.log(`Connected as: ${user.first_name} ${user.last_name} (${user.email})`);
      } catch (error: any) {
        console.error('Auth check failed:', error.message ?? error);
        process.exitCode = 1;
      }
    });
}
