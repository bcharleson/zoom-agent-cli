import { Command } from 'commander';
import { saveConfig, getConfigPath } from '../../core/config.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Store Zoom Server-to-Server OAuth credentials for CLI use')
    .action(async () => {
      try {
        const { input, password } = await import('@inquirer/prompts');

        const accountId = await input({
          message: 'Enter your Zoom Account ID:',
        });

        const clientId = await input({
          message: 'Enter your Zoom Client ID:',
        });

        const clientSecret = await password({
          message: 'Enter your Zoom Client Secret:',
          mask: '*',
        });

        if (!accountId || !clientId || !clientSecret) {
          console.error('All three credentials are required.');
          process.exitCode = 1;
          return;
        }

        await saveConfig({
          account_id: accountId,
          client_id: clientId,
          client_secret: clientSecret,
        });

        console.log(`Credentials saved to ${getConfigPath()}`);
        console.log('You can now use zoom commands without setting environment variables.');
      } catch (error: any) {
        if (error?.name === 'ExitPromptError') {
          return;
        }
        console.error('Login failed:', error.message ?? error);
        process.exitCode = 1;
      }
    });
}
