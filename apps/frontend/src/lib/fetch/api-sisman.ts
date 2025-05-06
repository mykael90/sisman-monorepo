// /home/node/sisman-monorepo/apps/frontend/src/lib/fetch/api-sisman.ts
import Logger from '@/lib/logger';

const logger = new Logger('ApiSisman');

/**
 * Fetches data from the SISMAN API.
 * This function is intended for endpoints that do not require user session authentication.
 *
 * @param relativeUrl - The relative URL of the SISMAN API endpoint to fetch data from.
 * @param options - Optional request initialization options (RequestInit).
 * @returns A Promise that resolves with the Response object from the fetch.
 * @throws Throws an error if necessary environment variables are missing or if the fetch request fails.
 */
export default async function fetchApiSisman(
  relativeUrl: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Get the SISMAN API Base URL
  const baseUrl = process.env.SISMAN_API_URL;
  if (!baseUrl) {
    logger.error(
      'fetchApiSisman: Environment variable SISMAN_API_URL is missing.'
    );
    throw new Error(
      'API configuration incomplete. SISMAN API base URL missing.'
    );
  }

  // 2. Construct the full URL
  // Ensure relativeUrl starts with '/' or handle joining appropriately
  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${relativeUrl.replace(
    /^\//,
    ''
  )}`;

  // 3. Construct the Headers
  // Add any other specific headers required by the SISMAN API for public endpoints
  const headers = {
    ...options.headers, // Allows overriding default headers if necessary
    'Content-Type': 'application/json' // Assume JSON, adjust if needed
    // No Authorization header here as this is for unauthenticated requests
    // If some public endpoints require a generic API key, it could be added here:
    // 'X-Public-API-Key': process.env.SISMAN_PUBLIC_API_KEY,
  };

  // 4. Perform the Fetch request
  try {
    logger.info(`fetchApiSisman: Fetching ${fullUrl}...`);
    const response = await fetch(fullUrl, { ...options, headers });

    // 5. Handle the Response
    if (!response.ok) {
      const errorBody = await response.text(); // Read body once
      const statusInfo = `${response.status} ${response.statusText}`;
      logger.error(
        `fetchApiSisman: Request failed with status: ${statusInfo}. URL: ${fullUrl}. Body: ${errorBody}`
      );
      throw new Error(
        `SISMAN API request failed (${statusInfo}) for URL: ${relativeUrl}. Response: ${errorBody}`
      );
    }

    logger.info(`fetchApiSisman: Request to ${fullUrl} successful.`);
    return response;
  } catch (error) {
    logger.error(
      `fetchApiSisman: Error during the request to ${fullUrl}:`,
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `An unexpected error occurred during the fetch to ${fullUrl}: ${String(
          error
        )}`
      );
    }
  }
}
