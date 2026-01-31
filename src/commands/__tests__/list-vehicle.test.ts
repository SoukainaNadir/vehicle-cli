import { Command } from 'commander';
import { registerListCommand } from '../list-vehicle';
import * as indexModule from '../../index';
import * as errorHandler from '../../utils/error-handler';
import { Vehicle } from '../../types/vehicle';

jest.mock('../../index', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../utils/error-handler', () => ({
  displayError: jest.fn(),
}));

describe('list-vehicle command', () => {
  let program: Command;
  let mockExit: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    registerListCommand(program);

    mockExit = jest.spyOn(process, 'exit').mockImplementation(
      (code?: string | number | null | undefined) => {
        throw new Error(`process.exit called with code ${code}`);
      }
    );

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
  });

  it('should register list-vehicle command', () => {
    const command = program.commands.find(cmd => cmd.name() === 'list-vehicle');
    expect(command).toBeDefined();
    expect(command?.description()).toBe('List vehicles');
  });

  it('should print "No vehicles found." when empty', async () => {
    (indexModule.httpClient.get as jest.Mock).mockResolvedValue({ vehicles: [] });

    await program.parseAsync(['node', 'test', 'list-vehicle']);

    expect(mockConsoleLog).toHaveBeenCalledWith('No vehicles found.');
  });

  it('should print vehicles when data exists', async () => {
    const vehicles: Vehicle[] = [
      { id: 1, shortcode: 'abc', battery: 50, position: { latitude: 12, longitude: 34 } },
      { id: 2, shortcode: 'def', battery: 80, position: { latitude: 56, longitude: 78 } },
    ];

    (indexModule.httpClient.get as jest.Mock).mockResolvedValue({ vehicles });

    await program.parseAsync(['node', 'test', 'list-vehicle']);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      'ID: 1 | Shortcode: abc | Battery: 50 | Lat: 12 | Lon: 34'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'ID: 2 | Shortcode: def | Battery: 80 | Lat: 56 | Lon: 78'
    );
  });

  it('should call displayError and exit on error', async () => {
    const error = new Error('Network error');
    (indexModule.httpClient.get as jest.Mock).mockRejectedValue(error);

    try {
      await program.parseAsync(['node', 'test', 'list-vehicle']);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(errorHandler.displayError).toHaveBeenCalledWith(error);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
