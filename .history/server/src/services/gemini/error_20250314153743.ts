export class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export const ErrorCodes = {
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_REQUEST: 'INVALID_REQUEST',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const handleGeminiError = (error: any): GeminiError => {
  // Handle specific error types from Gemini API
  if (error?.response?.status === 429) {
    return new GeminiError(
      'Rate limit exceeded',
      ErrorCodes.RATE_LIMIT,
      true
    );
  }

  if (error?.response?.status === 400) {
    return new GeminiError(
      'Invalid request to Gemini API',
      ErrorCodes.INVALID_REQUEST,
      false
    );
  }

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return new GeminiError(
      'Network error connecting to Gemini API',
      ErrorCodes.NETWORK_ERROR,
      true
    );
  }

  return new GeminiError(
    error?.message || 'Unknown Gemini API error',
    ErrorCodes.API_ERROR,
    false
  );
};