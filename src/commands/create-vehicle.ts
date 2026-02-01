import { Command } from 'commander';
import { httpClient } from '../index';
import { displayError } from '../utils/error-handler';
import { Vehicle } from '../types/vehicle';

export function registerCreateCommand(program: Command): void {
  program
    .command('create-vehicle')
    .description('Create a new vehicle')
    .requiredOption('-s, --shortcode <shortcode>', 'Vehicle shortcode')
    .requiredOption('-b, --battery <battery>', 'Battery level (0-100)', parseFloat)
    .requiredOption('--lat <latitude>', 'Latitude position', parseFloat)
    .requiredOption('--lon <longitude>', 'Longitude position', parseFloat)
    .action(async (options) => {
      try {
        if (options.battery < 0 || options.battery > 100) {
          console.error('Error: Battery level must be between 0 and 100');
          process.exit(1);
        }

        if (options.lat < -90 || options.lat > 90) {
          console.error('Error: Latitude must be between -90 and 90');
          process.exit(1);
        }

        if (options.lon < -180 || options.lon > 180) {
          console.error('Error: Longitude must be between -180 and 180');
          process.exit(1);
        }

        const vehicleData = {
          shortcode: options.shortcode,
          battery: options.battery,
          position: {
            latitude: options.lat,
            longitude: options.lon,
          },
        };

        const response: Vehicle = await httpClient.post('/vehicles', vehicleData);

        console.log('Vehicle created successfully:');
        console.log(`  ID: ${response.id}`);
        console.log(`  Shortcode: ${response.shortcode}`);
        console.log(`  Battery: ${response.battery}%`);
        console.log(`  Position: ${response.position.latitude}, ${response.position.longitude}`);
      } catch (error) {
        displayError(error);
        process.exit(1);
      }
    });
}