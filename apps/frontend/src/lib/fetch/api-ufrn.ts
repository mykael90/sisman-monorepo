// getServerSession e authOptions não são mais necessários aqui diretamente.
import Logger from '@/lib/logger';

const logger = new Logger('ApiUFRN');

/**
 * Fetches data from the UFRN API.
 *
 * This function is designed to be called from server-side contexts (Server Components,
 * Route Handlers, etc.). If an `accessTokenUfrn` is provided, it will be used
 * for authentication. It also requires `UFRN_XAPI_KEY` and `UFRN_API_URL`
 * environment variables to be set.
 *
 * @param relativeUrl - The relative URL of the UFRN API endpoint to fetch data from.
 * @param accessTokenUfrn - Optional. The UFRN access token for the authenticated user.
 *                          If provided, it will be included in the Authorization header.
 * @param options - Optional request initialization options (RequestInit).
 * @returns Uma Promise que resolve com o objeto Response do fetch.
 * @throws Lança um erro se o usuário não estiver autenticado, se variáveis de ambiente
 *         necessárias estiverem faltando, ou se a requisição fetch falhar.
 */
export default async function fetchApiUFRN(
  relativeUrl: string,
  accessTokenUfrn?: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Get the UFRN API Key
  const apiKey = process.env.UFRN_XAPI_KEY;
  if (!apiKey) {
    logger.error(
      'fetchApiUFRN: Environment variable UFRN_XAPI_KEY is missing.'
    );
    throw new Error('API configuration incomplete. UFRN X-API-Key missing.');
  }

  // 2. Get the UFRN API Base URL
  const baseUrl = process.env.UFRN_API_URL;
  if (!baseUrl) {
    logger.error('fetchApiUFRN: Environment variable UFRN_API_URL is missing.');
    throw new Error('API configuration incomplete. UFRN API base URL missing.');
  }

  // 3. Construct the full URL
  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${relativeUrl.replace(
    /^\//,
    ''
  )}`;

  // 4. Construir os Headers
  const headers = new Headers(options.headers);
  headers.set('X-API-Key', apiKey);
  headers.set('Content-Type', 'application/json');

  if (accessTokenUfrn) {
    headers.set('Authorization', `Bearer ${accessTokenUfrn}`);
  }

  // 5. Realizar a requisição Fetch
  try {
    logger.info(`fetchApiUFRN: Fetching ${fullUrl}...`);
    const response = await fetch(fullUrl, { ...options, headers });

    // 6. Tratar a Resposta
    if (!response.ok) {
      const errorBody = await response.text();
      const statusInfo = `${response.status} ${response.statusText}`;
      logger.error(
        `fetchApiUFRN: Request failed with status: ${statusInfo}. URL: ${fullUrl}. Body: ${errorBody}`
      );
      throw new Error(
        `UFRN API request failed (${statusInfo}) for URL: ${relativeUrl}. Response: ${errorBody}`
      );
    }

    logger.info(`fetchApiUFRN: Request to ${fullUrl} successful.`);
    return response;
  } catch (error) {
    logger.error(
      `fetchApiUFRN: Error during the request to ${fullUrl}:`,
      error instanceof Error ? error.message : error
    );
    if (error instanceof Error) {
      throw error; // Re-throw the original error if it's an Error instance
    } else {
      // Wrap non-Error throws in an Error object for better stack traces and handling
      throw new Error(
        `An unexpected error occurred during the fetch to ${fullUrl}: ${String(
          error
        )}`
      );
    }
  }
}
