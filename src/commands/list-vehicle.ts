import { Command } from 'commander';
import { httpClient } from '../index';
import { displayError } from '../utils/error-handler';
import { Vehicle } from '../types/vehicle';

export function registerListCommand(program: Command): void {
  program
    .command('list-vehicle')
    .description('List vehicles')
    .action(async () => {
      try {
        const response: { vehicles: Vehicle[] } = await httpClient.get('/vehicles');
        const vehicles = response.vehicles;

        if (!vehicles || vehicles.length === 0) {
          console.log('No vehicles found.');
          return;
        }

        vehicles.forEach((vehicle) => {
          console.log(
            `ID: ${vehicle.id} | Shortcode: ${vehicle.shortcode} | Battery: ${vehicle.battery} | Lat: ${vehicle.position.latitude} | Lon: ${vehicle.position.longitude}`
          );
        });
      } catch (error) {
        displayError(error);
        process.exit(1);
      }
    });
}
