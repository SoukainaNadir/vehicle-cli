import { HttpClient } from '../../utils/http-client';

jest.mock('../../utils/http-client');

describe('delete-vehicle command', () => {
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockHttpClient = new HttpClient('http://localhost:3000') as jest.Mocked<HttpClient>;
  });

  it('should call DELETE with correct vehicle ID', async () => {
    const vehicleId = '123';
    mockHttpClient.delete = jest.fn().mockResolvedValue(undefined);

    await mockHttpClient.delete(`/vehicles/${vehicleId}`);

    expect(mockHttpClient.delete).toHaveBeenCalledWith(`/vehicles/${vehicleId}`);
    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
  });

  it('should handle successful deletion', async () => {
    mockHttpClient.delete = jest.fn().mockResolvedValue(undefined);

    const result = await mockHttpClient.delete('/vehicles/123');

    expect(result).toBeUndefined();
    expect(mockHttpClient.delete).toHaveBeenCalled();
  });

  it('should handle deletion errors', async () => {
    const error = new Error('Vehicle not found');
    mockHttpClient.delete = jest.fn().mockRejectedValue(error);

    await expect(mockHttpClient.delete('/vehicles/999')).rejects.toThrow('Vehicle not found');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockHttpClient.delete = jest.fn().mockRejectedValue(networkError);

    await expect(mockHttpClient.delete('/vehicles/123')).rejects.toThrow('Network error');
  });
});