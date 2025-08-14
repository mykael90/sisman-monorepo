import Logger from '@/lib/logger';

const logger = new Logger('ApiSisman');

// (Nenhuma mudança na interface ISismanApiErrorResponse)
export interface ISismanApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp?: string;
  path?: string;
  [key: string]: any;
}

// (Nenhuma mudança na classe SismanApiError)
export class SismanApiError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly apiMessage: string;
  public readonly timestamp?: string;
  public readonly path?: string;
  public readonly rawErrorResponse?: ISismanApiErrorResponse;

  constructor(message: string, errorDetails: ISismanApiErrorResponse) {
    super(message);
    this.name = 'SismanApiError';

    this.statusCode = errorDetails.statusCode;
    this.errorType = errorDetails.error;
    this.apiMessage = Array.isArray(errorDetails.message)
      ? errorDetails.message.join('; ')
      : errorDetails.message;
    this.timestamp = errorDetails.timestamp;
    this.path = errorDetails.path;
    this.rawErrorResponse = errorDetails;

    Object.setPrototypeOf(this, SismanApiError.prototype);
  }
}

// (Nenhuma mudança na função isSismanApiErrorResponse)
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

// ========================================================================
// 0. NOVA FUNÇÃO AUXILIAR PARA QUERY PARAMS
// ========================================================================

/**
 * Type for query parameters. Allows for values that can be converted to strings.
 */
export type TQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Appends query parameters to a given URL.
 * Skips null or undefined values.
 *
 * @param url The base URL or relative path.
 * @param params The object containing query parameters.
 * @returns The new URL with the query string appended.
 */
function appendQueryParams(url: string, params?: TQueryParams): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  // URLSearchParams lida com a codificação de valores automaticamente (ex: espaços para %20)
  const searchParams = new URLSearchParams();
  for (const key in params) {
    // Adiciona o parâmetro apenas se o valor não for nulo ou indefinido
    const value = params[key];
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (!queryString) {
    return url;
  }

  // Adiciona '?' ou '&' conforme necessário
  return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
}

// ========================================================================
// 1. FUNÇÃO BASE (Nenhuma mudança aqui)
// ========================================================================

async function baseFetch(
  relativeUrl: string,
  accessTokenSisman?: string,
  options: RequestInit & { body?: any } = {}
): Promise<Response> {
  const baseUrl = process.env.SISMAN_API_URL;
  if (!baseUrl) {
    const errorMessage =
      'API configuration incomplete. SISMAN API base URL missing.';
    logger.error(`baseFetch: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanRelativeUrl = relativeUrl.replace(/^\//, '');
  const fullUrl = `${cleanBaseUrl}/${cleanRelativeUrl}`;

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessTokenSisman) {
    headers.set('Authorization', `Bearer ${accessTokenSisman}`);
  }

  try {
    logger.info(
      `baseFetch: Fetching ${fullUrl} with method ${options.method || 'GET'}`
    );

    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
      const errorBodyText = await response.text();
      const statusInfo = `${response.status} ${response.statusText}`;
      logger.error(
        `baseFetch: Request to ${fullUrl} failed with status: ${statusInfo}. Body: ${errorBodyText}`
      );

      let parsedError: any;
      try {
        parsedError = JSON.parse(errorBodyText);
      } catch (jsonParseError) {
        logger.warn(
          `baseFetch: Failed to parse error response from ${fullUrl} as JSON.`,
          jsonParseError
        );
        throw new Error(
          `SISMAN API request failed (${statusInfo}). Non-JSON response: ${errorBodyText}`
        );
      }

      if (isSismanApiErrorResponse(parsedError)) {
        const apiMessages = Array.isArray(parsedError.message)
          ? parsedError.message.join('; ')
          : parsedError.message;
        const userFriendlyErrorMessage = `SISMAN API Erro: ${parsedError.statusCode} ${parsedError.error}. Mensagem: ${apiMessages}`;
        throw new SismanApiError(userFriendlyErrorMessage, parsedError);
      } else {
        logger.warn(
          `baseFetch: Error response from ${fullUrl} has unexpected JSON structure. Body: ${errorBodyText}`
        );
        throw new Error(
          `SISMAN API request failed (${statusInfo}). Unexpected error structure: ${errorBodyText}`
        );
      }
    }

    return response;
  } catch (error) {
    if (error instanceof SismanApiError) {
      throw error;
    }
    if (error instanceof Error) {
      logger.error(
        `baseFetch: Generic error during request to ${fullUrl}: ${error.message}`,
        { stack: error.stack }
      );
      throw error;
    }
    logger.error(
      `baseFetch: Unexpected non-Error type caught during request to ${fullUrl}: ${String(error)}`
    );
    throw new Error(
      `An unexpected error occurred during the fetch to ${fullUrl}: ${String(error)}`
    );
  }
}

// ========================================================================
// 2. FUNÇÃO PÚBLICA PARA JSON (REFATORADA) // <-- MUDANÇA AQUI
// ========================================================================

/**
 * Fetches JSON data from the SISMAN API.
 * Always expects a JSON response. For file downloads, use `fetchApiSismanFile`.
 *
 * @param relativeUrl The relative URL of the SISMAN API endpoint.
 * @param accessTokenSisman Optional. The SISMAN access token.
 * @param options Optional request initialization options (RequestInit).
 * @param queryParams Optional. An object of query parameters to be appended to the URL.
 * @returns A Promise that resolves with the parsed JSON data of type T.
 * @throws {SismanApiError} If the API returns a structured error.
 * @throws {Error} For network issues or other non-API errors.
 */
export async function fetchApiSisman<T = any>(
  relativeUrl: string,
  accessTokenSisman?: string,
  options: RequestInit & { body?: any } = {},
  queryParams?: TQueryParams // <-- NOVO PARÂMETRO
): Promise<T> {
  // Constrói a URL final com os parâmetros antes de chamar o baseFetch
  const finalUrl = appendQueryParams(relativeUrl, queryParams);

  const response = await baseFetch(finalUrl, accessTokenSisman, options);

  if (
    response.status === 204 ||
    response.headers.get('content-length') === '0'
  ) {
    return null as T;
  }

  const data = await response.json();
  return data as T;
}

// ========================================================================
// 3. FUNÇÃO PÚBLICA PARA ARQUIVOS (REFATORADA) // <-- MUDANÇA AQUI
// ========================================================================

export interface ISismanFileResponse {
  buffer: ArrayBuffer;
  contentType: string | null;
}

/**
 * Fetches a file (binary data) from the SISMAN API.
 * Always expects a binary response. For JSON data, use `fetchApiSisman`.
 *
 * @param relativeUrl The relative URL of the SISMAN API endpoint.
 * @param accessTokenSisman Optional. The SISMAN access token.
 * @param options Optional request initialization options (RequestInit).
 * @param queryParams Optional. An object of query parameters to be appended to the URL.
 * @returns A Promise that resolves with an object containing the ArrayBuffer and the Content-Type header.
 * @throws {SismanApiError} If the API returns a structured error.
 * @throws {Error} For network issues or other non-API errors.
 */
export async function fetchApiSismanFile(
  relativeUrl: string,
  accessTokenSisman?: string,
  options: RequestInit & { body?: any } = {},
  queryParams?: TQueryParams // <-- NOVO PARÂMETRO
): Promise<ISismanFileResponse> {
  // Constrói a URL final com os parâmetros antes de chamar o baseFetch
  const finalUrl = appendQueryParams(relativeUrl, queryParams);

  const response = await baseFetch(finalUrl, accessTokenSisman, options);

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type');

  return { buffer, contentType };
}
