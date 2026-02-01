import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

describe('CLI Integration Tests', () => {
    const CLI_PATH = './dist/index.js';

    beforeAll(async () => {
        await execAsync('pnpm run build');
    });

    describe('Help and Validation', () => {
        it('should show help when no arguments', async () => {
            try {
                const { stdout } = await execAsync(`node ${CLI_PATH}`);
                expect(stdout).toContain('vehicle-cli');
                expect(stdout).toContain('Usage:');
                expect(stdout).toContain('Options:');
            } catch (error: any) {
                const output = error.stdout || error.stderr || '';
                expect(output).toContain('vehicle-cli');
                expect(output).toContain('Usage:');
                expect(output).toContain('Options:');
            }
        });

        it('should show version', async () => {
            const { stdout } = await execAsync(`node ${CLI_PATH} --version`);

            expect(stdout).toContain('1.0.0');
        });

        it('should accept --address option', async () => {
            const { stdout } = await execAsync(
                `node ${CLI_PATH} --address http://test:3000 --help`
            );

            expect(stdout).toContain('vehicle-cli');
        });

        it('should accept -a shorthand', async () => {
            const { stdout } = await execAsync(
                `node ${CLI_PATH} -a http://test:3000 --help`
            );

            expect(stdout).toContain('vehicle-cli');
        });

        it('should reject invalid URL', async () => {
            try {
                await execAsync(
                    `node ${CLI_PATH} --address invalid-url list-vehicle`
                );
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.stderr || error.stdout).toContain('Invalid URL');
            }
        });
    });

    describe('Command Recognition', () => {
        it('should recognize create-vehicle command', async () => {
            const { stdout } = await execAsync(
                `node ${CLI_PATH} create-vehicle --help`
            );

            expect(stdout).toContain('Create a new vehicle');
            expect(stdout).toContain('--shortcode');
            expect(stdout).toContain('--battery');
            expect(stdout).toContain('--lat');
            expect(stdout).toContain('--lon');
        });

        it('should recognize list-vehicle command', async () => {
            const { stdout } = await execAsync(
                `node ${CLI_PATH} list-vehicle --help`
            );

            expect(stdout).toContain('List vehicles');
        });

        it('should recognize delete-vehicle command', async () => {
            const { stdout } = await execAsync(
                `node ${CLI_PATH} delete-vehicle --help`
            );

            expect(stdout).toContain('Delete a vehicle by ID');
            expect(stdout).toContain('--id');
        });

        it('should show error for unknown command', async () => {
            try {
                await execAsync(`node ${CLI_PATH} unknown-command`);
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.stderr || error.stdout).toMatch(/unknown command/i);
            }
        });
    });

    describe('Error Handling', () => {
        it('should require --shortcode for create-vehicle', async () => {
            try {
                await execAsync(
                    `node ${CLI_PATH} create-vehicle --battery 50 --lat 10 --lon 20`
                );
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.stderr || error.stdout).toMatch(/required option.*shortcode/i);
            }
        });

        it('should require --battery for create-vehicle', async () => {
            try {
                await execAsync(
                    `node ${CLI_PATH} create-vehicle --shortcode ABC --lat 10 --lon 20`
                );
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.stderr || error.stdout).toMatch(/required option.*battery/i);
            }
        });

        it('should require --id for delete-vehicle', async () => {
            try {
                await execAsync(`node ${CLI_PATH} delete-vehicle`);
                fail('Should have thrown');
            } catch (error: any) {
                expect(error.stderr || error.stdout).toMatch(/required option.*id/i);
            }
        });
    });

    describe('Main Execution Flow', () => {
        it('should parse process.argv correctly', async () => {
            const { stdout } = await execAsync(`node ${CLI_PATH} --help`);

            expect(stdout).toContain('vehicle-cli');
            expect(stdout).toContain('-a, --address <url>');
        });

        it('should use default address when not specified', async () => {
            const { stdout } = await execAsync(`node ${CLI_PATH} --help`);

            expect(stdout).toContain('http://localhost:3000');
        });
    });
});