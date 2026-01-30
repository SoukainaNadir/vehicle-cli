import axios, { AxiosError } from 'axios';
import { formatError, validateUrl, displayError } from '../error-handler';

describe('error-handler utilities', () => {
  describe('formatError', () => {
    it('should format Axios error with response', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Vehicle not found' },
        },
        message: 'Request failed',
      } as AxiosError;

      const result = formatError(axiosError);

      expect(result).toEqual({
        message: 'Vehicle not found',
        statusCode: 404,
        details: { message: 'Vehicle not found' },
      });
    });

    it('should format Axios error without response', () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
        message: 'Network Error',
      } as AxiosError;

      const result = formatError(axiosError);

      expect(result).toEqual({
        message: 'No response from server. Please check if the server is running.',
        details: 'Network Error',
      });
    });

    it('should format Axios error with setup issue', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request setup failed',
      } as AxiosError;

      const result = formatError(axiosError);

      expect(result).toEqual({
        message: 'Request setup failed',
      });
    });

    it('should format generic Error', () => {
      const error = new Error('Something went wrong');

      const result = formatError(error);

      expect(result).toEqual({
        message: 'Something went wrong',
      });
    });

    it('should handle unknown error type', () => {
      const error = { weird: 'object' };

      const result = formatError(error);

      expect(result).toEqual({
        message: 'An unknown error occurred',
        details: error,
      });
    });
  });

  describe('validateUrl', () => {
    it('should validate correct HTTP URL', () => {
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('should validate correct HTTPS URL', () => {
      expect(validateUrl('https://api.example.com')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(validateUrl('not-a-url')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateUrl('')).toBe(false);
    });

    it('should validate URL with port', () => {
      expect(validateUrl('http://localhost:8080')).toBe(true);
    });

    it('should validate URL with path', () => {
      expect(validateUrl('http://localhost:3000/api/vehicles')).toBe(true);
    });
  });

  describe('displayError', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should display error message', () => {
      const error = new Error('Test error');
      
      displayError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('\nError:', 'Test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('');
    });

    it('should display error with status code', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
        message: 'Request failed',
      } as AxiosError;

      displayError(axiosError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('\nError:', 'Server error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('   Status Code: 500');
    });

    it('should display error with details', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Bad request', errors: ['field1', 'field2'] },
        },
        message: 'Request failed',
      } as AxiosError;

      displayError(axiosError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '   Details:',
        expect.stringContaining('Bad request')
      );
    });
  });
});