// /home/mykael/ts-sisman/sisman-ui/src/lib/fetch/api-sisman-user-session.ts
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/_options'; // Adjust path if necessary
import Logger from '@/lib/logger';

const logger = new Logger('ApiSismanUserSession');

// Define a more specific interface for your session, if possible.
// The exact location of the accessToken depends on your `jwt` and `session` callbacks in authOptions.
interface UserSession extends Session {
  // Example: adjust according to the actual structure of your session for SISMAN
  accessTokenSisman?: string;
  // or perhaps:
  // user?: {
  //   accessTokenSisman?: string; // Specific token for SISMAN
  //   [key: string]: any;
  // } & DefaultSession['user'];
}

/**
 * Fetches data from the SISMAN API using the access token from the authenticated user's session.
 *
 * This function should be used in Server Components, Route Handlers, or `getServerSideProps`
 * where `getServerSession` can be called.
 *
 * @param relativeUrl - The relative URL of the SISMAN API endpoint to fetch data from.
 * @param options - Optional request initialization options (RequestInit).
 * @returns A Promise that resolves with the Response object from the fetch.
 * @throws Throws an error if the user is not authenticated, if necessary environment
 *         variables are missing, or if the fetch request fails.
 */
export default async function fetchApiSismanUserSession(
  relativeUrl: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Get the user session
  // The type assertion `as UserSession | null` might be necessary depending on your setup.
  const session = (await getServerSession(authOptions)) as UserSession | null;

  if (!session) {
    logger.error('fetchApiSismanUserSession: No active user session found.');
    // Throw an error to be handled by the caller (e.g., redirect to login)
    throw new Error('User not authenticated.');
  }

  // 2. Extract the access token
  // Adjust 'accessTokenSisman' based on the actual structure of your session in `authOptions`
  const userAccessToken = session.accessTokenSisman; // Make sure this key exists in your session

  if (!userAccessToken) {
    logger.error(
      'fetchApiSismanUserSession: Access token not found in the user session.'
    );
    throw new Error('User access token not found in session.');
  }

  // 3. Get the SISMAN API Base URL
  const baseUrl = process.env.SISMAN_API_URL; // Use a specific env var for SISMAN
  if (!baseUrl) {
    logger.error(
      'fetchApiSismanUserSession: Environment variable SISMAN_API_URL is missing.'
    );
    throw new Error(
      'API configuration incomplete. SISMAN API base URL missing.'
    );
  }

  // 3.1 Construct the full URL
  // Ensure relativeUrl starts with '/' or handle joining appropriately
  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${relativeUrl.replace(/^\//, '')}`;

  // 4. Construct the Headers
  // Add any other specific headers required by the SISMAN API
  const headers = {
    ...options.headers, // Allows overriding default headers if necessary
    Authorization: `Bearer ${userAccessToken}`,
    'Content-Type': 'application/json' // Assume JSON, adjust if needed
    // Add other SISMAN-specific headers here if required (e.g., an API Key if different from UFRN)
    // 'X-Another-API-Key': process.env.SISMAN_OTHER_KEY,
  };

  // 5. Perform the Fetch request
  try {
    logger.info(`fetchApiSismanUserSession: Fetching ${fullUrl}...`);
    const response = await fetch(fullUrl, { ...options, headers });

    // 6. Handle the Response
    if (!response.ok) {
      const errorBody = await response.text(); // Read body once
      const statusInfo = `${response.status} ${response.statusText}`;
      logger.error(
        `fetchApiSismanUserSession: Request failed with status: ${statusInfo}. URL: ${fullUrl}. Body: ${errorBody}`
      );
      // Provide a more informative error message
      throw new Error(
        `SISMAN API request failed (${statusInfo}) for URL: ${relativeUrl}. Response: ${errorBody}`
      );
    }

    logger.info(`fetchApiSismanUserSession: Request to ${fullUrl} successful.`);
    return response;
  } catch (error) {
    // Log the specific error caught
    logger.error(
      `fetchApiSismanUserSession: Error during the request to ${fullUrl}:`,
      error instanceof Error ? error.message : error
    );
    // Re-throw the error (either the fetch error or the one we threw above)
    // Ensure the original error context isn't lost if it's not an Error instance
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `An unexpected error occurred during the fetch to ${fullUrl}: ${String(error)}`
      );
    }
  }
}
