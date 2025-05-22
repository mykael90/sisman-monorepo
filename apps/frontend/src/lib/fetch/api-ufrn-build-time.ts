interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

import Logger from '@/lib/logger';

const logger = new Logger('ApiUFRNBuildTime');
interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Authenticates with the UFRN API using client credentials.
 * @param cache - The cache mode for the authentication request. Defaults to 'default'.
 * @returns A promise that resolves with the token response.
 * @throws Throws an error if authentication fails.
 */
async function authenticate(
  cache: RequestCache = 'force-cache'
): Promise<TokenResponse> {
  // Ensure environment variables are defined or provide defaults
  const clientId = process.env.UFRN_CLIENT_ID;
  const clientSecret = process.env.UFRN_CLIENT_SECRET;
  const tokenUrl = process.env.UFRN_TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    logger.error(
      'Missing UFRN authentication environment variables (UFRN_CLIENT_ID, UFRN_CLIENT_SECRET, UFRN_TOKEN_URL)'
    );
    throw new Error(
      'Configuração de autenticação incompleta. Variáveis de ambiente ausentes.'
    );
  }

  const formData = new URLSearchParams();
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);
  formData.append('grant_type', 'client_credentials');

  try {
    logger.info(`Attempting authentication with cache mode: ${cache}`);
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      cache: cache
    });

    if (!response.ok) {
      // Log more details about the failed response
      const errorBody = await response.text();
      logger.error(
        `Authentication failed with status: ${response.status} ${response.statusText}. Response body: ${errorBody}`
      );
      throw new Error(
        `Falha na autenticação: ${response.status} ${response.statusText}`
      );
    }

    const data: TokenResponse = await response.json();
    logger.info('Authentication successful:', data); // Consider removing sensitive data logging in production
    return data;
  } catch (error) {
    logger.error('Error during authentication request:', error);
    // Re-throw a more specific error or handle it as needed
    throw new Error(`Erro ao tentar autenticar: ${error.message}`);
  }
}

/**
 * Fetches data from the UFRN API using build-time credentials.
 * Handles potential credential expiration by attempting re-authentication without cache.
 *
 * Note: As Next.js might cache the response of this function during build time,
 * use it primarily for static data fetching during the build process.
 * For dynamic content, prefer using user-specific access tokens.
 *
 * @param url - The URL to fetch data from.
 * @param options - Optional request initialization options.
 * @returns A promise that resolves with the fetch Response object.
 * @throws Throws an error if both initial fetch and retry fetch fail.
 */
export async function fetchApiUFRNBuildTime(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.UFRN_XAPI_KEY;
  if (!apiKey) {
    logger.error('Missing UFRN_XAPI_KEY environment variable.');
    throw new Error('Configuração da API incompleta. Chave X-API-Key ausente.');
  }

  try {
    // First attempt using potentially cached credentials
    logger.info('Fetching UFRN API data (initial attempt)...');
    const credentials = await authenticate(); // Uses default cache

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${credentials.access_token}`,
      'X-API-Key': apiKey,
      'Content-Type': 'application/json' // Default Content-Type for UFRN API calls
    };

    const response = await fetch(url, { ...options, headers });

    // Check if the first attempt failed specifically due to authorization (e.g., 401 Unauthorized)
    // Adjust the status code check based on your API's specific response for expired/invalid tokens
    if (!response.ok && response.status === 401) {
      logger.warn(
        'Initial fetch failed with 401, possibly due to expired credentials. Retrying without cache...'
      );
      // Throw an error to trigger the catch block for re-authentication
      throw new Error('Unauthorized - Credentials might be expired');
    } else if (!response.ok) {
      // Handle other non-OK responses
      const errorBody = await response.text();
      logger.error(
        `Initial fetch failed with status: ${response.status} ${response.statusText}. URL: ${url}. Response body: ${errorBody}`
      );
      throw new Error(
        `Falha na requisição inicial: ${response.status} ${response.statusText}`
      );
    }

    logger.info('Initial fetch successful.');
    return response; // Return the successful response from the first attempt
  } catch (error) {
    logger.error(
      'Error during initial fetch or authentication:',
      error.message
    );

    // Only retry if the error suggests an authentication issue (e.g., the 401 thrown above)
    // You might want to refine this condition based on specific error types or messages
    if (
      error.message.includes('Unauthorized') ||
      error.message.includes('autenticação')
    ) {
      try {
        logger.info('Retrying authentication without cache...');
        const freshCredentials = await authenticate('no-cache'); // Force re-authentication

        const freshHeaders = {
          ...options.headers,
          Authorization: `Bearer ${freshCredentials.access_token}`,
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        };

        logger.info('Retrying fetch with fresh credentials...');
        const retryResponse = await fetch(url, {
          ...options,
          headers: freshHeaders
        });

        if (!retryResponse.ok) {
          const retryErrorBody = await retryResponse.text();
          logger.error(
            `Retry fetch failed with status: ${retryResponse.status} ${retryResponse.statusText}. URL: ${url}. Response body: ${retryErrorBody}`
          );
          throw new Error(
            `Falha na requisição após nova tentativa: ${retryResponse.status} ${retryResponse.statusText}`
          );
        }

        logger.info('Retry fetch successful.');
        return retryResponse; // Return the successful response from the retry
      } catch (retryError) {
        logger.error(
          'Error during retry fetch or re-authentication:',
          retryError
        );
        // If the retry also fails, re-throw the error to indicate final failure
        throw retryError;
      }
    } else {
      // If the initial error was not related to authentication, re-throw it directly
      throw error;
    }
  }
}
