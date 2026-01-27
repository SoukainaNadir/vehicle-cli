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
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    
    if (axiosError.response) {
      // Server responded with error status
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
      // Request made but no response
      return {
        message: 'No response from server. Please check if the server is running.',
        details: axiosError.message,
      };
    } else {
      // Error setting up request
      return {
        message: axiosError.message,
      };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Unknown error type
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