// /home/mykael/ts-sisman/sisman-ui/src/lib/fetch/api-sisman-user-session.ts
import Logger from '@/lib/logger';
// getServerSession e authOptions não são mais necessários aqui diretamente.

const logger = new Logger('ApiSismanUserSession');

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
 * @throws Throws an error if necessary environment variables are missing,
 *         or if the fetch request fails.
 */
export default async function fetchApiSisman(
  relativeUrl: string,
  accessTokenSisman?: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Get the SISMAN API Base URL
  const baseUrl = process.env.SISMAN_API_URL;
  if (!baseUrl) {
    logger.error(
      'fetchApiSismanUserSession: Environment variable SISMAN_API_URL is missing.'
    );
    throw new Error(
      'API configuration incomplete. SISMAN API base URL missing.'
    );
  }

  // 2. Construct the full URL
  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${relativeUrl.replace(
    /^\//,
    ''
  )}`;

  // 3. Construct the Headers
  // Initialize a new Headers object. This correctly handles all
  // variants of HeadersInit (Headers, string[][], Record<string, string>).
  const headers = new Headers(options.headers);

  // Set or override the Content-Type header.
  headers.set('Content-Type', 'application/json');

  // If an access token is provided, add it to the Authorization header.
  if (accessTokenSisman) {
    headers.set('Authorization', `Bearer ${accessTokenSisman}`);
  }

  // 4. Perform the Fetch request
  try {
    logger.info(`fetchApiSismanUserSession: Fetching ${fullUrl}...`);
    const response = await fetch(fullUrl, { ...options, headers });

    // 5. Handle the Response
    if (!response.ok) {
      const errorBody = await response.text();
      const statusInfo = `${response.status} ${response.statusText}`;
      logger.error(
        `fetchApiSismanUserSession: Request failed with status: ${statusInfo}. URL: ${fullUrl}. Body: ${errorBody}`
      );
      throw new Error(
        `SISMAN API request failed (${statusInfo}) for URL: ${relativeUrl}. Response: ${errorBody}`
      );
    }

    logger.info(`fetchApiSismanUserSession: Request to ${fullUrl} successful.`);
    return response;
  } catch (error) {
    logger.error(
      `fetchApiSismanUserSession: Error during the request to ${fullUrl}:`,
      error instanceof Error ? error.message : error
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
