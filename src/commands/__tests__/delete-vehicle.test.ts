import { Command } from 'commander';
import { registerDeleteCommand } from '../delete-vehicle';
import * as indexModule from '../../index';
import * as errorHandler from '../../utils/error-handler';

jest.mock('../../index', () => ({
  httpClient: {
    delete: jest.fn(),
  },
}));

jest.mock('../../utils/error-handler', () => ({
  displayError: jest.fn(),
}));

describe('delete-vehicle command', () => {
  let program: Command;
  let mockExit: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    
    registerDeleteCommand(program);
    
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`process.exit called with code ${code}`);
    });
    
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
  });

  it('should register delete-vehicle command', () => {
    const command = program.commands.find(cmd => cmd.name() === 'delete-vehicle');
    
    expect(command).toBeDefined();
    expect(command?.description()).toBe('Delete a vehicle by ID');
  });

  it('should call DELETE with correct vehicle ID', async () => {
    const vehicleId = '123';
    const mockDelete = indexModule.httpClient.delete as jest.Mock;
    mockDelete.mockResolvedValue(undefined);

    await program.parseAsync(['node', 'test', 'delete-vehicle', '--id', vehicleId]);

    expect(mockDelete).toHaveBeenCalledWith(`/vehicles/${vehicleId}`);
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockConsoleLog).toHaveBeenCalledWith(`Vehicle ${vehicleId} deleted successfully`);
  });

  it('should handle successful deletion', async () => {
    const mockDelete = indexModule.httpClient.delete as jest.Mock;
    mockDelete.mockResolvedValue(undefined);

    await program.parseAsync(['node', 'test', 'delete-vehicle', '--id', '456']);

    expect(mockDelete).toHaveBeenCalledWith('/vehicles/456');
    expect(mockConsoleLog).toHaveBeenCalledWith('Vehicle 456 deleted successfully');
  });

  it('should handle deletion errors and call displayError', async () => {
    const error = new Error('Vehicle not found');
    const mockDelete = indexModule.httpClient.delete as jest.Mock;
    const mockDisplayError = errorHandler.displayError as jest.Mock;
    
    mockDelete.mockRejectedValue(error);

    try {
      await program.parseAsync(['node', 'test', 'delete-vehicle', '--id', '999']);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(mockDelete).toHaveBeenCalledWith('/vehicles/999');
    expect(mockDisplayError).toHaveBeenCalledWith(error);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    const mockDelete = indexModule.httpClient.delete as jest.Mock;
    const mockDisplayError = errorHandler.displayError as jest.Mock;
    
    mockDelete.mockRejectedValue(networkError);

    try {
      await program.parseAsync(['node', 'test', 'delete-vehicle', '--id', '123']);
    } catch (e) {
      expect((e as Error).message).toContain('process.exit called with code 1');
    }

    expect(mockDisplayError).toHaveBeenCalledWith(networkError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should require --id option', async () => {
    await expect(
      program.parseAsync(['node', 'test', 'delete-vehicle'])
    ).rejects.toThrow();
  });

  it('should accept --id with value', async () => {
    const mockDelete = indexModule.httpClient.delete as jest.Mock;
    mockDelete.mockResolvedValue(undefined);

    await program.parseAsync(['node', 'test', 'delete-vehicle', '--id', 'abc-123']);

    expect(mockDelete).toHaveBeenCalledWith('/vehicles/abc-123');
  });
});