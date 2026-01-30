import axios from 'axios';
import { HttpClient } from '../http-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  let httpClient: HttpClient;
  const baseURL = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any);

    httpClient = new HttpClient(baseURL);
  });

  describe('constructor', () => {
    it('should create instance with correct baseURL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
    });

    it('should return correct baseURL', () => {
      expect(httpClient.getBaseURL()).toBe(baseURL);
    });
  });

  describe('get', () => {
    it('should make GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockClient = mockedAxios.create();
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await httpClient.get('/vehicles');

      expect(result).toEqual(mockData);
    });
  });

  describe('post', () => {
    it('should make POST request and return data', async () => {
      const mockData = { id: 1, name: 'New Vehicle' };
      const postData = { name: 'New Vehicle', type: 'car' };
      const mockClient = mockedAxios.create();
      (mockClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await httpClient.post('/vehicles', postData);

      expect(result).toEqual(mockData);
    });
  });

  describe('put', () => {
    it('should make PUT request and return data', async () => {
      const mockData = { id: 1, name: 'Updated Vehicle' };
      const putData = { name: 'Updated Vehicle' };
      const mockClient = mockedAxios.create();
      (mockClient.put as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await httpClient.put('/vehicles/1', putData);

      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should make DELETE request and return data', async () => {
      const mockClient = mockedAxios.create();
      (mockClient.delete as jest.Mock).mockResolvedValue({ data: undefined });

      const result = await httpClient.delete('/vehicles/1');

      expect(result).toBeUndefined();
    });
  });
});