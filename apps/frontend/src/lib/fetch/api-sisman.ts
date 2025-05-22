import Logger from '@/lib/logger';

const logger = new Logger('ApiSisman');

/**
 * Interface representing the expected structure of an error response from the SISMAN API.
 */
export interface ISismanApiErrorResponse {
  statusCode: number;
  error: string; // Corresponds to errorType
  message: string | string[]; // API message can be a single string or an array of strings
  timestamp?: string;
  path?: string;
  [key: string]: any; // Allow for other potential properties
}

/**
 * Custom error class for errors originating from the SISMAN API.
 * It includes specific details from the API's error response.
 */
export class SismanApiError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly apiMessage: string; // This will be a unified string message
  public readonly timestamp?: string;
  public readonly path?: string;
  public readonly rawErrorResponse?: ISismanApiErrorResponse;

  constructor(
    // User-friendly message for the Error object (this.message)
    message: string,
    // Details from the API error response
    errorDetails: ISismanApiErrorResponse
  ) {
    super(message);
    this.name = 'SismanApiError';

    this.statusCode = errorDetails.statusCode;
    this.errorType = errorDetails.error;
    // Unify API message into a single string for easier consumption
    this.apiMessage = Array.isArray(errorDetails.message)
      ? errorDetails.message.join('; ')
      : errorDetails.message;
    this.timestamp = errorDetails.timestamp;
    this.path = errorDetails.path;
    this.rawErrorResponse = errorDetails;

    // This line is important for instances of custom errors to work correctly
    Object.setPrototypeOf(this, SismanApiError.prototype);
  }
}

/**
 * Type guard to check if an object conforms to the ISismanApiErrorResponse structure.
 */
function isSismanApiErrorResponse(obj: any): obj is ISismanApiErrorResponse {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  return (
    typeof obj.statusCode === 'number' &&
    typeof obj.error === 'string' &&
    (typeof obj.message === 'string' ||
      (Array.isArray(obj.message) &&
        obj.message.every((item: any) => typeof item === 'string')))
  );
}

/**
 * Fetches data from the SISMAN API.
 *
 * This function is designed to be called from server-side contexts (Server Components,
 * Route Handlers, etc.). If an `accessTokenSisman` is provided, it will be used
 * for authentication.
 *
 * @param relativeUrl - The relative URL of the SISMAN API endpoint to fetch data from.
 * @param accessTokenSisman - Optional. The SISMAN access token for the authenticated user.
 *                            If provided, it will be included in the Authorization header.
 * @param options - Optional request initialization options (RequestInit).
 * @returns A Promise that resolves with the Response object from the fetch.
 * @throws Throws an error if necessary environment variables are missing.
 * @throws Throws a generic `Error` if the fetch request fails for non-API reasons
 *         or if the API error response is not in the expected JSON format.
 * @throws Throws {@link SismanApiError} if the API returns an error response
 *         in the expected JSON format.
 */
export async function fetchApiSisman(
  relativeUrl: string,
  accessTokenSisman?: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = process.env.SISMAN_API_URL;
  if (!baseUrl) {
    const errorMessage =
      'API configuration incomplete. SISMAN API base URL missing.';
    logger.error(`fetchApiSisman: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // Ensure no double slashes and no missing slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanRelativeUrl = relativeUrl.replace(/^\//, '');
  const fullUrl = `${cleanBaseUrl}/${cleanRelativeUrl}`;

  const headers = new Headers(options.headers); // Handles various HeadersInit types
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessTokenSisman) {
    headers.set('Authorization', `Bearer ${accessTokenSisman}`);
  }

  try {
    logger.info(
      `fetchApiSisman: Fetching ${fullUrl} with method ${options.method || 'GET'}`
    );
    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
      const errorBodyText = await response.text();
      const statusInfo = `${response.status} ${response.statusText}`;
      logger.error(
        `fetchApiSisman: Request to ${fullUrl} failed with status: ${statusInfo}. Body: ${errorBodyText}`
      );

      let parsedError: any;
      try {
        parsedError = JSON.parse(errorBodyText);
      } catch (jsonParseError) {
        logger.warn(
          `fetchApiSisman: Failed to parse error response body from ${fullUrl} as JSON. Body: ${errorBodyText}`,
          jsonParseError
        );
        throw new Error(
          `SISMAN API request failed (${statusInfo}) for URL: ${relativeUrl}. Non-JSON response: ${errorBodyText}`
        );
      }

      if (isSismanApiErrorResponse(parsedError)) {
        // Now parsedError is typed as ISismanApiErrorResponse
        const apiMessages = Array.isArray(parsedError.message)
          ? parsedError.message.join('; ')
          : parsedError.message;

        const userFriendlyErrorMessage = `SISMAN API Error: ${parsedError.statusCode} ${parsedError.error} on ${parsedError.path || relativeUrl}. API Message(s): ${apiMessages}`;

        throw new SismanApiError(
          userFriendlyErrorMessage, // User-friendly message for Error.message
          parsedError // The full parsed error object conforming to ISismanApiErrorResponse
        );
      } else {
        // The JSON is valid, but not in the expected SISMAN error format
        logger.warn(
          `fetchApiSisman: Error response from ${fullUrl} has unexpected JSON structure. Body: ${errorBodyText}`
        );
        throw new Error(
          `SISMAN API request failed (${statusInfo}) for URL: ${relativeUrl}. Unexpected error structure: ${errorBodyText}`
        );
      }
    }

    logger.info(`fetchApiSisman: Request to ${fullUrl} successful.`);
    return response;
  } catch (error) {
    // Re-throw SismanApiError instances directly
    if (error instanceof SismanApiError) {
      // Already logged when creating SismanApiError or by the logger in its constructor if implemented
      // For consistency, we can log its re-throw point too.
      logger.error(
        `fetchApiSisman: Re-throwing SismanApiError for ${fullUrl}. Status: ${error.statusCode}, Type: ${error.errorType}, API Msg: ${error.apiMessage}`
      );
      throw error;
    }
    // Handle other generic errors
    if (error instanceof Error) {
      logger.error(
        `fetchApiSisman: Generic error during request to ${fullUrl}: ${error.message}`,
        { stack: error.stack }
      );
      // Re-throw if it's not already one of our specific types from above
      throw error;
    }
    // Handle non-Error objects thrown
    logger.error(
      `fetchApiSisman: Unexpected non-Error type caught during request to ${fullUrl}: ${String(error)}`
    );
    throw new Error(
      `An unexpected error occurred during the fetch to ${fullUrl}: ${String(error)}`
    );
  }
}
