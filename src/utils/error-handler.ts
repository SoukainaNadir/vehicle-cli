import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Format error messages for CLI output
 */
export function formatError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    
    if (axiosError.response) {
      const responseData = axiosError.response.data;
      const errorMessage = 
        (responseData && typeof responseData === 'object' && 'message' in responseData) 
          ? String(responseData.message)
          : axiosError.message;
      
      return {
        message: errorMessage,
        statusCode: axiosError.response.status,
        details: axiosError.response.data,
      };
    } else if (axiosError.request) {
      return {
        message: 'No response from server. Please check if the server is running.',
        details: axiosError.message,
      };
    } else {
      return {
        message: axiosError.message,
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred',
    details: error,
  };
}

/**
 * Display error message to console
 */
export function displayError(error: unknown): void {
  const apiError = formatError(error);
  
  console.error('\nError:', apiError.message);
  
  if (apiError.statusCode) {
    console.error(`   Status Code: ${apiError.statusCode}`);
  }
  
  if (apiError.details && typeof apiError.details === 'object') {
    console.error('   Details:', JSON.stringify(apiError.details, null, 2));
  }
  
  console.error('');
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}