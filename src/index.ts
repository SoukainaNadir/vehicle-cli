import { Command } from 'commander';
import { HttpClient } from './utils/http-client';
import { validateUrl } from './utils/error-handler';
import { registerDeleteCommand } from './commands/delete-vehicle';
import { registerListCommand } from './commands/list-vehicle';

const program = new Command();

program
  .name('vehicle-cli')
  .description('CLI tool to manage vehicles via HTTP API')
  .version('1.0.0')
  .option('-a, --address <url>', 'Server address', 'http://localhost:3000');

let httpClient: HttpClient;


function initializeClient(address: string): HttpClient {
  if (!validateUrl(address)) {
    console.error(`Invalid URL: ${address}`);
    process.exit(1);
  }
  return new HttpClient(address);
}

program.hook('preAction', (thisCommand) => {
  const options = thisCommand.opts();
  httpClient = initializeClient(options.address);
});

registerDeleteCommand(program);
registerListCommand(program)

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export { httpClient, initializeClient };