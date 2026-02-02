import { Command } from 'commander';
import { httpClient } from '../index';
import { displayError } from '../utils/error-handler';

export function registerDeleteCommand(program: Command): void {
  program
    .command('delete-vehicle')
    .description('Delete a vehicle by ID')
    .requiredOption('-i, --id <id>', 'Vehicle ID')
    .action(async (options) => {
      try {
        await httpClient.delete(`/vehicles/${options.id}`);
        console.log(`Vehicle ${options.id} deleted successfully`);
      } catch (error) {
        displayError(error);
        process.exit(1);
      }
    });
}