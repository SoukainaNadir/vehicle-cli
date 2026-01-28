import { Command } from 'commander';
import { HttpClient } from './utils/http-client';
import { validateUrl } from './utils/error-handler';

const program = new Command();

// CLI configuration
program
  .name('vehicle-cli')
  .description('CLI tool to manage vehicles via HTTP API')
  .version('1.0.0')
  .option('-a, --address <url>', 'Server address', 'http://localhost:3000');

let httpClient: HttpClient;

/**
 * Initialize HTTP client with validated address
 */
function initializeClient(address: string): HttpClient {
  if (!validateUrl(address)) {
    console.error(`Invalid URL: ${address}`);
    process.exit(1);
  }
  return new HttpClient(address);
}

// Hook to initialize client before each command
program.hook('preAction', (thisCommand) => {
  const options = thisCommand.opts();
  httpClient = initializeClient(options.address);
});

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// Export for testing
export { httpClient, initializeClient };