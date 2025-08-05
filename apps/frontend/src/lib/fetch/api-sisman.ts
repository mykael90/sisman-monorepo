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

// ========================================================================
// 1. FUNÇÃO BASE (PRIVADA AO MÓDULO)
// Esta função contém toda a lógica repetida e retorna a `Response` bruta
// em caso de sucesso, para que as funções públicas possam processá-la como quiserem.
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

  // Define o Content-Type apenas se não for FormData e não estiver definido
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

    // O tratamento de erro é idêntico e centralizado aqui.
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

    // Em caso de sucesso, simplesmente retorna o objeto Response
    return response;
  } catch (error) {
    // A lógica de `catch` também é centralizada aqui.
    if (error instanceof SismanApiError) {
      throw error; // Apenas repassa o erro já tratado
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
// 2. FUNÇÃO PÚBLICA PARA JSON (REFATORADA)
// Agora é mais simples, mais limpa e fortemente tipada com genéricos.
// ========================================================================

/**
 * Fetches JSON data from the SISMAN API.
 * Always expects a JSON response. For file downloads, use `fetchApiSismanFile`.
 *
 * @param relativeUrl The relative URL of the SISMAN API endpoint.
 * @param accessTokenSisman Optional. The SISMAN access token.
 * @param options Optional request initialization options (RequestInit).
 * @returns A Promise that resolves with the parsed JSON data of type T.
 * @throws {SismanApiError} If the API returns a structured error.
 * @throws {Error} For network issues or other non-API errors.
 */
export async function fetchApiSisman<T = any>(
  relativeUrl: string,
  accessTokenSisman?: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  const response = await baseFetch(relativeUrl, accessTokenSisman, options);

  // Trata respostas sem conteúdo (ex: 204 No Content) que causam erro no .json()
  if (
    response.status === 204 ||
    response.headers.get('content-length') === '0'
  ) {
    return null as T; // ou undefined, como preferir.
  }

  const data = await response.json();
  return data as T;
}

// ========================================================================
// 3. NOVA FUNÇÃO PÚBLICA PARA ARQUIVOS
// Clara, explícita e com um único propósito.
// ========================================================================

/**
 * Retorna um objeto contendo os dados do arquivo e seu tipo de conteúdo.
 */
export interface ISismanFileResponse {
  buffer: ArrayBuffer;
  contentType: string | null;
}

/**
 * Fetches a file (binary data) from the SISMAN API.
 * Always expects a binary response (e.g., image, PDF). For JSON data, use `fetchApiSisman`.
 *
 * @param relativeUrl The relative URL of the SISMAN API endpoint.
 * @param accessTokenSisman Optional. The SISMAN access token.
 * @param options Optional request initialization options (RequestInit).
 * @returns A Promise that resolves with an object containing the ArrayBuffer and the Content-Type header.
 * @throws {SismanApiError} If the API returns a structured error (e.g., file not found).
 * @throws {Error} For network issues or other non-API errors.
 */
export async function fetchApiSismanFile(
  relativeUrl: string,
  accessTokenSisman?: string,
  options: RequestInit & { body?: any } = {}
): Promise<ISismanFileResponse> {
  // <-- MUDANÇA AQUI
  const response = await baseFetch(relativeUrl, accessTokenSisman, options);

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type');

  return { buffer, contentType }; // <-- MUDANÇA AQUI
}
