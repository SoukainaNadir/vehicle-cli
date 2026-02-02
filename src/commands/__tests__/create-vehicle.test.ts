import { Command } from 'commander';
import { registerCreateCommand } from '../create-vehicle';
import * as indexModule from '../../index';
import * as errorHandler from '../../utils/error-handler';

jest.mock('../../index', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

jest.mock('../../utils/error-handler', () => ({
  displayError: jest.fn(),
}));

describe('create-vehicle command', () => {
  let program: Command;
  let mockExit: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    registerCreateCommand(program);

    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`process.exit called with code ${code}`);
    });

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should register create-vehicle command', () => {
    const command = program.commands.find(cmd => cmd.name() === 'create-vehicle');
    expect(command).toBeDefined();
    expect(command?.description()).toBe('Create a new vehicle');
  });

  it('should create vehicle with valid data', async () => {
    const mockResponse = {
      vehicle: {
        id: 1,
        shortcode: 'ABC123',
        battery: 75,
        position: { latitude: 48.8566, longitude: 2.3522 },
      },
    };

    (indexModule.httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

    await program.parseAsync([
      'node',
      'test',
      'create-vehicle',
      '--shortcode', 'ABC123',
      '--battery', '75',
      '--lat', '48.8566',
      '--lon', '2.3522',
    ]);

    expect(indexModule.httpClient.post).toHaveBeenCalledWith('/vehicles', {
      shortcode: 'ABC123',
      battery: 75,
      latitude: 48.8566,
      longitude: 2.3522,
    });

    expect(mockConsoleLog).toHaveBeenCalledWith('Vehicle created successfully:');
    expect(mockConsoleLog).toHaveBeenCalledWith('  ID: 1');
    expect(mockConsoleLog).toHaveBeenCalledWith('  Shortcode: ABC123');
    expect(mockConsoleLog).toHaveBeenCalledWith('  Battery: 75%');
    expect(mockConsoleLog).toHaveBeenCalledWith('  Position: 48.8566, 2.3522');
  });

  it('should reject battery level below 0', async () => {
    try {
      await program.parseAsync([
        'node',
        'test',
        'create-vehicle',
        '--shortcode', 'ABC123',
        '--battery', '-10',
        '--lat', '48.8566',
        '--lon', '2.3522',
      ]);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(mockConsoleError).toHaveBeenCalledWith('Error: Battery level must be between 0 and 100');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should reject battery level above 100', async () => {
    try {
      await program.parseAsync([
        'node',
        'test',
        'create-vehicle',
        '--shortcode', 'ABC123',
        '--battery', '150',
        '--lat', '48.8566',
        '--lon', '2.3522',
      ]);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(mockConsoleError).toHaveBeenCalledWith('Error: Battery level must be between 0 and 100');
  });

  it('should reject invalid latitude', async () => {
    try {
      await program.parseAsync([
        'node',
        'test',
        'create-vehicle',
        '--shortcode', 'ABC123',
        '--battery', '75',
        '--lat', '95',
        '--lon', '2.3522',
      ]);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(mockConsoleError).toHaveBeenCalledWith('Error: Latitude must be between -90 and 90');
  });

  it('should reject invalid longitude', async () => {
    try {
      await program.parseAsync([
        'node',
        'test',
        'create-vehicle',
        '--shortcode', 'ABC123',
        '--battery', '75',
        '--lat', '48.8566',
        '--lon', '200',
      ]);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(mockConsoleError).toHaveBeenCalledWith('Error: Longitude must be between -180 and 180');
  });

  it('should handle API errors', async () => {
    const error = new Error('Server error');
    (indexModule.httpClient.post as jest.Mock).mockRejectedValue(error);

    try {
      await program.parseAsync([
        'node',
        'test',
        'create-vehicle',
        '--shortcode', 'ABC123',
        '--battery', '75',
        '--lat', '48.8566',
        '--lon', '2.3522',
      ]);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(errorHandler.displayError).toHaveBeenCalledWith(error);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should require all options', async () => {
    await expect(
      program.parseAsync(['node', 'test', 'create-vehicle'])
    ).rejects.toThrow();
  });

  it('should accept valid coordinates at boundaries', async () => {
    const mockResponse = {
      vehicle: {
        id: 2,
        shortcode: 'EDGE',
        battery: 0,
        position: { latitude: -90, longitude: -180 },
      },
    };

    (indexModule.httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

    await program.parseAsync([
      'node',
      'test',
      'create-vehicle',
      '--shortcode', 'EDGE',
      '--battery', '0',
      '--lat', '-90',
      '--lon', '-180',
    ]);

    expect(indexModule.httpClient.post).toHaveBeenCalledWith('/vehicles', {
      shortcode: 'EDGE',
      battery: 0,
      latitude: -90,
      longitude: -180,
    });
  });
});