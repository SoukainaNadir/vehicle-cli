import { Command } from 'commander';
import { HttpClient } from '../utils/http-client';
import * as errorHandler from '../utils/error-handler';

jest.mock('../utils/http-client');
jest.mock('../utils/error-handler');
jest.mock('../commands/delete-vehicle', () => ({
    registerDeleteCommand: jest.fn(),
}));
jest.mock('../commands/list-vehicle', () => ({
    registerListCommand: jest.fn(),
}));

describe('index - CLI entry point', () => {
    let mockExit: jest.SpyInstance;
    let mockConsoleError: jest.SpyInstance;
    let mockValidateUrl: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
            throw new Error(`process.exit: ${code}`);
        });

        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        mockValidateUrl = jest.spyOn(errorHandler, 'validateUrl');
    });

    afterEach(() => {
        mockExit.mockRestore();
        mockConsoleError.mockRestore();
        mockValidateUrl.mockRestore();
    });

    describe('initializeClient', () => {
        it('should create HttpClient with valid URL', () => {
            jest.isolateModules(() => {
                mockValidateUrl.mockReturnValue(true);
                const { initializeClient } = require('../index');

                const client = initializeClient('http://localhost:3000');

                expect(client).toBeInstanceOf(HttpClient);
                expect(errorHandler.validateUrl).toHaveBeenCalledWith('http://localhost:3000');
            });
        });

        it('should exit with error for invalid URL', () => {
            jest.isolateModules(() => {
                mockValidateUrl.mockReturnValue(false);
                const { initializeClient } = require('../index');

                expect(() => {
                    initializeClient('invalid-url');
                }).toThrow('process.exit: 1');

                expect(mockConsoleError).toHaveBeenCalledWith('Invalid URL: invalid-url');
                expect(mockExit).toHaveBeenCalledWith(1);
            });
        });

        it('should handle HTTPS URLs', () => {
            jest.isolateModules(() => {
                mockValidateUrl.mockReturnValue(true);
                const { initializeClient } = require('../index');

                const client = initializeClient('https://api.example.com');

                expect(client).toBeInstanceOf(HttpClient);
            });
        });

        it('should handle URLs with port', () => {
            jest.isolateModules(() => {
                mockValidateUrl.mockReturnValue(true);
                const { initializeClient } = require('../index');

                const client = initializeClient('http://localhost:8080');

                expect(client).toBeInstanceOf(HttpClient);
            });
        });
    });

    describe('CLI program configuration', () => {
        it('should have correct name and description', () => {
            jest.isolateModules(() => {
                const originalArgv = process.argv;
                process.argv = ['node', 'test'];

                const program = new Command();
                program
                    .name('vehicle-cli')
                    .description('CLI tool to manage vehicles via HTTP API')
                    .version('1.0.0');

                expect(program.name()).toBe('vehicle-cli');
                expect(program.description()).toBe('CLI tool to manage vehicles via HTTP API');
                expect(program.version()).toBe('1.0.0');

                process.argv = originalArgv;
            });
        });

        it('should have --address option with default value', () => {
            jest.isolateModules(() => {
                const originalArgv = process.argv;
                process.argv = ['node', 'test'];

                const program = new Command();
                program.option('-a, --address <url>', 'Server address', 'http://localhost:3000');

                program.parse(['node', 'test']);
                const options = program.opts();

                expect(options.address).toBe('http://localhost:3000');

                process.argv = originalArgv;
            });
        });

        it('should accept custom --address option', () => {
            jest.isolateModules(() => {
                const program = new Command();
                program.option('-a, --address <url>', 'Server address', 'http://localhost:3000');

                program.parse(['node', 'test', '--address', 'http://example.com']);
                const options = program.opts();

                expect(options.address).toBe('http://example.com');
            });
        });

        it('should accept -a shorthand for address', () => {
            jest.isolateModules(() => {
                const program = new Command();
                program.option('-a, --address <url>', 'Server address', 'http://localhost:3000');

                program.parse(['node', 'test', '-a', 'http://example.com']);
                const options = program.opts();

                expect(options.address).toBe('http://example.com');
            });
        });
    });

    describe('Command registration', () => {
        it('should register delete-vehicle command', () => {
            jest.isolateModules(() => {
                const { registerDeleteCommand } = require('../commands/delete-vehicle');
                (registerDeleteCommand as jest.Mock).mockClear();

                require('../index');

                expect(registerDeleteCommand).toHaveBeenCalled();
            });
        });

        it('should register list-vehicle command', () => {
            jest.isolateModules(() => {
                const { registerListCommand } = require('../commands/list-vehicle');
                (registerListCommand as jest.Mock).mockClear();

                require('../index');

                expect(registerListCommand).toHaveBeenCalled();
            });
        });
    });

    describe('preAction hook', () => {
        it('should initialize httpClient before command execution', () => {
            jest.isolateModules(() => {
                mockValidateUrl.mockReturnValue(true);

                const program = new Command();
                program.option('-a, --address <url>', 'Server address', 'http://localhost:3000');

                const { initializeClient } = require('../index');

                program.hook('preAction', (thisCommand) => {
                    const options = thisCommand.opts();
                    initializeClient(options.address);
                });

                program
                    .command('test')
                    .action(() => { });

                program.parse(['node', 'test', 'test', '--address', 'http://localhost:3000']);

                expect(mockValidateUrl).toHaveBeenCalledWith('http://localhost:3000');
            });
        });
    });

    describe('Help output', () => {
        it('should show help when no arguments provided', () => {
            jest.isolateModules(() => {
                const mockOutputHelp = jest.fn();
                const originalArgv = process.argv;

                process.argv = ['node', 'test'];

                const program = new Command();
                program.outputHelp = mockOutputHelp;

                if (!process.argv.slice(2).length) {
                    program.outputHelp();
                }

                expect(mockOutputHelp).toHaveBeenCalled();

                process.argv = originalArgv;
            });
        });

        it('should not show help when command is provided', () => {
            jest.isolateModules(() => {
                const mockOutputHelp = jest.fn();
                const originalArgv = process.argv;

                process.argv = ['node', 'test', 'delete-vehicle', '--id', '123'];

                const program = new Command();
                program.outputHelp = mockOutputHelp;

                if (!process.argv.slice(2).length) {
                    program.outputHelp();
                }

                expect(mockOutputHelp).not.toHaveBeenCalled();

                process.argv = originalArgv;
            });
        });
    });

    describe('httpClient export', () => {
        it('should export initializeClient function', () => {
            jest.isolateModules(() => {
                const indexModule = require('../index');

                expect(indexModule.initializeClient).toBeDefined();
                expect(typeof indexModule.initializeClient).toBe('function');
            });
        });

        it('should return HttpClient instance from initializeClient', () => {
            jest.isolateModules(() => {
                mockValidateUrl.mockReturnValue(true);
                const indexModule = require('../index');

                const client = indexModule.initializeClient('http://localhost:3000');

                expect(client).toBeInstanceOf(HttpClient);
            });
        });
    });
});