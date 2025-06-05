// src/sipac/sipac.service.ts
import {
  Injectable,
  Logger,
  Inject,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom, catchError } from 'rxjs';
import * as cheerio from 'cheerio';
import { AxiosError, AxiosResponse } from 'axios';
// Ensure this path is correct based on your project structure
import { FetchSipacPageDto } from './sipac.controller'; // Ajuste o path se necessário

import {
  IHtmlParser,
  PARSER_MAP_TOKEN,
} from './html-parser/ihtml-parser.interface'; // Importe a interface e o token

// Constants for cache keys
const AUTH_COOKIE_KEY = 'sipac_auth_cookies';
const AUTH_RETRY_COUNT_KEY = 'sipac_auth_retry_count';

@Injectable()
export class SipacService {
  private readonly logger = new Logger(SipacService.name);
  private readonly loginUrl: string;
  private readonly baseSipacUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly authRetryLimit: number;
  private readonly cacheTtl: number; // Expects seconds from config

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // Ensure HtmlParserService is correctly imported and provided in sipac.module.ts
    // private readonly htmlParser: HtmlParserService,
    // private readonly htmlReqMaterialParser: ReqMaterialParserService,
    @Inject(PARSER_MAP_TOKEN)
    private readonly parserMap: Map<string, IHtmlParser>,
  ) {
    // Load configuration values safely
    this.loginUrl = this.configService.getOrThrow<string>('LOGIN_URL');
    this.baseSipacUrl = this.configService.getOrThrow<string>('BASE_SIPAC_URL');
    this.username = this.configService.getOrThrow<string>('SIPAC_USERNAME');
    this.password = this.configService.getOrThrow<string>('SIPAC_PASSWORD');
    this.authRetryLimit = this.configService.get<number>('AUTH_RETRY_LIMIT', 2);
    // Get TTL in seconds from config, will multiply by 1000 for cacheManager
    this.cacheTtl = this.configService.get<number>('CACHE_TTL_SECONDS', 5400);

    this.logger.log(
      'SipacService initialized. Authentication will occur on first request.',
    );
    this.logger.log(
      `SipacService initialized. Available parsers: [${Array.from(this.parserMap.keys()).join(', ')}]`,
    );
    // Initial authentication is now deferred to getAuthCookies
  }

  /**
   * Performs the full authentication flow: CAS login + SIPAC ticket validation.
   * Returns the final combined cookies necessary for accessing SIPAC pages.
   */
  private async performFullAuthentication(): Promise<string[]> {
    this.logger.log(
      'Performing full authentication (CAS + SIPAC Ticket Validation)...',
    );
    await this.cacheManager.del(AUTH_RETRY_COUNT_KEY); // Reset retry count

    let initialCookies: string[] = []; // Store cookies between steps

    try {
      // --- Step 1: CAS Authentication ---

      // 1a: GET Login Page to get initial cookies and form tokens
      this.logger.debug(`CAS Auth Step 1a: GET ${this.loginUrl}`);
      const initialResponse = await firstValueFrom(
        this.httpService
          .get<string>(this.loginUrl, {
            headers: {
              // Standard browser-like headers
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'pt,pt-BR;q=0.9,en;q=0.8',
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `CAS Auth Step 1a (GET Login Page) Failed: ${error.message}`,
                error.stack,
              );
              throw new InternalServerErrorException(
                'Failed to fetch initial CAS login page',
              );
            }),
          ),
      );
      initialCookies = this.extractCookies(initialResponse.headers); // Capture initial JSESSIONID (CAS domain)
      const initialHtml = initialResponse.data;
      const $ = cheerio.load(initialHtml);
      const lt = $('input[name="lt"]').val();
      const execution = $('input[name="execution"]').val();

      if (!lt || !execution) {
        this.logger.error(
          'Failed to extract "lt" or "execution" token from CAS login page.',
        );
        throw new InternalServerErrorException(
          'Could not parse CAS login form tokens.',
        );
      }
      this.logger.debug(`Initial CAS cookies: ${initialCookies.join('; ')}`);
      this.logger.debug(`Extracted CAS lt: ${lt}, execution: ${execution}`);

      // 1b: POST Credentials to CAS
      this.logger.debug(
        `CAS Auth Step 1b: POST to ${this.loginUrl} (no auto redirect)`,
      );
      const loginData = new URLSearchParams();
      loginData.append('username', this.username);
      loginData.append('password', this.password);
      loginData.append('lt', lt);
      loginData.append('execution', execution);
      loginData.append('_eventId', 'submit');
      // Double-check this value against the actual form's submit button
      loginData.append('submit', 'Submit');

      const postResponse = await firstValueFrom(
        this.httpService
          .post<string>(this.loginUrl, loginData.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
              Referer: this.loginUrl,
              Cookie: initialCookies.join('; '), // Send initial JSESSIONID
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
              Origin: new URL(this.loginUrl).origin,
              'Accept-Language': 'pt,pt-BR;q=0.9,en;q=0.8',
              'Cache-Control': 'max-age=0',
              Connection: 'keep-alive',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-origin',
              'Sec-Fetch-User': '?1',
              'Upgrade-Insecure-Requests': '1',
            },
            maxRedirects: 0, // Do not follow redirects automatically
            validateStatus: (status) => status >= 200 && status < 400, // Accept 302 as non-error
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `CAS Auth Step 1b (POST Credentials) Failed: ${error.message}`,
              );
              if (error.response) {
                this.logger.error(`Status: ${error.response.status}`);
                const responseData = error.response.data;
                if (typeof responseData === 'string') {
                  this.logger.error(
                    `Body: ${responseData.substring(0, 500)}...`,
                  );
                }
              }
              throw new InternalServerErrorException('Failed CAS POST request');
            }),
          ),
      );

      // --- Analyze CAS POST Response ---
      if (postResponse.status !== 302) {
        this.logger.error(
          `CAS Auth failed: Expected 302 redirect, received ${postResponse.status}.`,
        );
        if (
          postResponse.status === 200 &&
          typeof postResponse.data === 'string'
        ) {
          this.logger.error(
            `Body Excerpt (check for 'Credenciais Inválidas'): ${postResponse.data.substring(0, 800)}...`,
          );
          if (
            postResponse.data.includes('Credenciais Inválidas') ||
            postResponse.data.includes('Invalid Credentials')
          ) {
            throw new UnauthorizedException(
              'Invalid Credentials (explicit message found).',
            );
          }
        }
        throw new UnauthorizedException(
          `CAS Authentication failed (Status: ${postResponse.status})`,
        );
      }

      // --- Got 302 from CAS ---
      const locationHeaderTicketUrl = postResponse.headers['location']; // URL with ticket
      const casCookies = this.extractCookies(postResponse.headers); // Should contain CASTGC, maybe new JSESSIONID

      const hasCASTGC = casCookies.some((cookie) =>
        cookie.startsWith('CASTGC='),
      );

      if (!hasCASTGC || !locationHeaderTicketUrl?.includes('ticket=ST-')) {
        this.logger.error(
          `CAS Auth OK (302) but CASTGC or Ticket URL missing. Location: ${locationHeaderTicketUrl}, Cookies: ${casCookies.join('; ')}`,
        );
        throw new UnauthorizedException(
          'CAS Auth succeeded but CASTGC or Ticket URL missing.',
        );
      }
      this.logger.debug(
        `CAS Auth successful. Ticket URL: ${locationHeaderTicketUrl}`,
      );

      // Prepare cookies for the *next* step (SIPAC ticket validation)
      // Use initial cookies + cookies from the 302 response (overwriting if names match)
      const cookiesForTicketValidation = this.mergeCookies(
        initialCookies,
        casCookies,
      );
      this.logger.debug(
        `Cookies for Ticket Validation GET: ${cookiesForTicketValidation.join('; ')}`,
      );

      // --- Step 2: SIPAC Ticket Validation (GET Request to Ticket URL - No Auto Redirect) ---
      this.logger.debug(
        `SIPAC Ticket Validation Step 2: GET ${locationHeaderTicketUrl} (no auto redirect)`,
      );
      const ticketValidationResponse = await firstValueFrom(
        this.httpService
          .get<string>(locationHeaderTicketUrl, {
            headers: {
              Cookie: cookiesForTicketValidation.join('; '), // Send combined CAS cookies
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              Referer: this.loginUrl, // Referer is the previous CAS page
              'Accept-Language': 'pt,pt-BR;q=0.9,en;q=0.8',
              Connection: 'keep-alive',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'same-site', // Going from autenticacao -> sipac
              'Upgrade-Insecure-Requests': '1',
            },
            maxRedirects: 0, // *** CRITICAL: DO NOT follow redirects here ***
            validateStatus: (status) => status >= 200 && status < 400, // Accept 302 as success
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `SIPAC Ticket validation GET failed: ${error.message}`,
              );
              if (error.response) {
                this.logger.error(`Status: ${error.response.status}`);
                this.logger.error(
                  `Headers: ${JSON.stringify(error.response.headers)}`,
                );
                const responseData = error.response.data;
                if (typeof responseData === 'string') {
                  this.logger.error(
                    `Body: ${responseData.substring(0, 500)}...`,
                  );
                }
              }
              throw new InternalServerErrorException(
                'Failed GET for SIPAC ticket validation.',
              );
            }),
          ),
      );

      // --- Analyze Ticket Validation Response ---
      if (ticketValidationResponse.status !== 302) {
        // If SIPAC doesn't respond with a redirect after successful ticket validation,
        // it usually means failure (often redirects back to CAS login, caught by isLoginPage)
        this.logger.error(
          `Ticket validation failed: Expected 302 redirect from SIPAC after ticket validation, received ${ticketValidationResponse.status}.`,
        );
        if (this.isLoginPage(ticketValidationResponse)) {
          // This checks if the response content or URL looks like the CAS login page
          this.logger.error(
            'Ticket validation failed: Response indicates CAS login page.',
          );
          throw new UnauthorizedException(
            'Ticket validation failed (Landed on CAS Login Page).',
          );
        }
        // Log body excerpt if available and not login page
        if (typeof ticketValidationResponse.data === 'string') {
          this.logger.error(
            `Ticket validation response body excerpt: ${ticketValidationResponse.data.substring(0, 500)}...`,
          );
        }
        throw new UnauthorizedException(
          `Ticket validation failed (SIPAC Status: ${ticketValidationResponse.status})`,
        );
      }

      // --- Got 302 from SIPAC (Ticket Validation Success!) ---
      this.logger.log(
        'SIPAC Ticket validation successful (Received 302 redirect from SIPAC).',
      );
      const finalRedirectUrl = ticketValidationResponse.headers['location']; // Should be the target page within SIPAC
      const sipacCookies = this.extractCookies(
        ticketValidationResponse.headers,
      ); // Should contain JSESSIONID for sipac.ufrn.br domain
      this.logger.debug(`SIPAC redirecting to: ${finalRedirectUrl}`);
      this.logger.debug(`Cookies set by SIPAC: ${sipacCookies.join('; ')}`);

      // Combine ALL cookies needed for subsequent requests: CAS context + SIPAC session
      const finalCombinedCookies = this.mergeCookies(
        cookiesForTicketValidation, // Contains CASTGC + initial/CAS JSESSIONID
        sipacCookies, // Contains SIPAC JSESSIONID
      );

      // Sanity check: Ensure we have the SIPAC JSESSIONID
      // Note: The exact name might differ, but JSESSIONID is common
      const hasSipacSession = finalCombinedCookies.some(
        (c) => c.toUpperCase().startsWith('JSESSIONID='), // Case-insensitive check
      );
      if (!hasSipacSession) {
        // This might not be fatal if SIPAC uses another cookie name, but it's a warning sign
        this.logger.warn(
          'Could not confirm standard JSESSIONID cookie set by SIPAC after ticket validation. Session might not work correctly if another name is used.',
        );
      }

      this.logger.log(
        'Full authentication successful (CAS + SIPAC Ticket Validation + SIPAC Session established).',
      );
      this.logger.debug(
        `Storing final combined cookies in cache (TTL: ${this.cacheTtl * 1000}ms): ${finalCombinedCookies.join('; ')}`,
      );
      // Store the complete set of necessary cookies in cache using milliseconds for TTL
      await this.cacheManager.set(
        AUTH_COOKIE_KEY,
        finalCombinedCookies,
        this.cacheTtl * 1000,
      );
      await this.cacheManager.del(AUTH_RETRY_COUNT_KEY); // Reset retry counter on full success
      return finalCombinedCookies; // Return the complete set of cookies needed for SIPAC access
    } catch (error) {
      this.logger.error(
        `Full authentication process failed: ${error.message}`,
        error.stack,
      );
      // If it was an authorization failure, clear potentially bad cached state
      if (error instanceof UnauthorizedException) {
        await this.invalidateAuth();
      }
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Retrieves valid cookies from cache or triggers the full authentication flow.
   * Manages retry attempts for authentication failures.
   */
  async getAuthCookies(retryCount = 0): Promise<string[]> {
    const cachedCookies =
      await this.cacheManager.get<string[]>(AUTH_COOKIE_KEY);
    if (cachedCookies && cachedCookies.length > 0) {
      this.logger.debug('Using cached authentication cookies.');
      return cachedCookies;
    }

    this.logger.log(
      'No valid cached cookies found. Triggering full authentication.',
    );
    // Check retry limit before attempting authentication
    if (retryCount >= this.authRetryLimit) {
      this.logger.error(
        `Authentication retry limit (${this.authRetryLimit}) reached.`,
      );
      throw new UnauthorizedException(
        'Authentication failed after multiple retries.',
      );
    }

    try {
      // Attempt the full authentication flow
      const newCookies = await this.performFullAuthentication();
      return newCookies;
    } catch (error) {
      this.logger.error(
        `Full Authentication attempt ${retryCount + 1} failed. Error: ${error.message}`,
      );
      // Rethrow the error to be caught by the caller (e.g., fetchAndParse's retry logic)
      throw error;
    }
  }

  /** Clears authentication cookies from the cache. */
  async invalidateAuth(): Promise<void> {
    this.logger.warn('Invalidating authentication cookies from cache.');
    await this.cacheManager.del(AUTH_COOKIE_KEY);
    // Also clear the retry count if it exists
    await this.cacheManager.del(AUTH_RETRY_COUNT_KEY);
  }

  /** Scheduled task to proactively refresh authentication cookies during working hours (Mon-Fri). */
  // Cron pattern: Run at the start of every hour (minute 0) between 5 AM and 7 PM (hours 5-19), Monday to Friday (day of week 1-5).
  @Cron('0 5-20 * * 1-5') // <<< AJUSTE AQUI
  async handleCronAuthentication() {
    this.logger.log('Scheduled task: Running periodic re-authentication.');
    try {
      // Perform the full authentication including ticket validation
      await this.performFullAuthentication();
      this.logger.log('Scheduled re-authentication successful.');
    } catch (error) {
      this.logger.error(`Scheduled re-authentication failed: ${error.message}`);
      // Consider adding more robust error handling or notifications here
    }
  }

  private async _fetchAndParsePage(
    fetchParams: FetchSipacPageDto,
    parser: IHtmlParser, // Pass the selected parser instance
    callerAttemptNumber: number, // Recebe o número da tentativa do chamador
  ): Promise<any> {
    const { targetUrl, targetBody, targetMethod = 'GET' } = fetchParams;
    const method = targetMethod.toUpperCase();
    let internalAuthRetryAttempt = 0; // Retry attempts for *this specific page*

    // Log inicial incluindo a tentativa do chamador
    this.logger.log(
      `Iniciando busca da página (Tentativa do Chamador: ${callerAttemptNumber}): ${method} ${targetUrl}`,
    );

    while (internalAuthRetryAttempt <= this.authRetryLimit) {
      try {
        this.logger.log(
          `Tentativa Interna de Autenticação ${internalAuthRetryAttempt + 1} para busca (Tentativa do Chamador: ${callerAttemptNumber}): ${method} ${targetUrl}`,
        );
        const cookies = await this.getAuthCookies(internalAuthRetryAttempt);

        let response: AxiosResponse<string>;
        const commonHeaders = {
          /* ... (same as before) ... */ 'User-Agent': '...',
          Cookie: cookies.join('; '),
          Referer:
            fetchParams.targetReferer ||
            this.baseSipacUrl + '/sipac/portal_administrativo/index.jsf', // Allow specific referer
          Accept: '...',
          'Accept-Language': '...',
          Connection: 'keep-alive',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          Origin: this.baseSipacUrl,
        };

        if (method === 'POST') {
          if (!targetBody) {
            throw new BadRequestException(
              `POST request requires a 'targetBody'.`,
            );
          }
          response = await firstValueFrom(
            this.httpService
              .post<string>(targetUrl, targetBody, {
                headers: {
                  ...commonHeaders,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                responseEncoding: 'latin1',
              })
              .pipe(
                /* ... catchError logic ... */
                catchError((error: AxiosError) => {
                  this.logger.error(
                    `POST request to ${targetUrl} failed: Status ${error.response?.status}, Message: ${error.message}`,
                  );
                  // Simplified error checking for brevity
                  if (error.response && this.isLoginPage(error.response)) {
                    throw new UnauthorizedException(
                      'Session invalid during POST.',
                    );
                  }
                  const responseData = error.response?.data as
                    | string
                    | undefined;
                  this.logger.error(
                    `POST Error Body Excerpt: ${responseData?.substring(0, 500) ?? 'N/A'}...`,
                  );
                  throw new InternalServerErrorException(
                    `Failed POST to ${targetUrl}: ${error.message}`,
                  );
                }),
              ),
          );
        } else {
          // GET
          const urlToFetch = targetBody
            ? `${targetUrl}?${targetBody}`
            : targetUrl;
          response = await firstValueFrom(
            this.httpService
              .get<string>(urlToFetch, {
                headers: commonHeaders,
                responseEncoding: 'latin1',
              })
              .pipe(
                /* ... catchError logic ... */
                catchError((error: AxiosError) => {
                  this.logger.error(
                    `GET request to ${urlToFetch} failed: Status ${error.response?.status}, Message: ${error.message}`,
                  );
                  if (error.response && this.isLoginPage(error.response)) {
                    throw new UnauthorizedException(
                      'Session invalid during GET.',
                    );
                  }
                  const responseData = error.response?.data as
                    | string
                    | undefined;
                  this.logger.error(
                    `GET Error Body Excerpt: ${responseData?.substring(0, 500) ?? 'N/A'}...`,
                  );
                  throw new InternalServerErrorException(
                    `Failed GET to ${urlToFetch}: ${error.message}`,
                  );
                }),
              ),
          );
        }

        if (this.isLoginPage(response)) {
          throw new UnauthorizedException(
            'Session likely expired (Login page content found).',
          );
        }

        this.logger.log(
          `Página buscada com sucesso ${method} ${targetUrl} (Status: ${response.status}) na Tentativa do Chamador ${callerAttemptNumber}, Retentativa Interna ${internalAuthRetryAttempt + 1}. Parsing...`,
        );
        // Use the PASSED parser instance
        const parsedData = parser.parse(response.data, targetUrl);
        // Add the raw HTML to the parsed data for potential use in pagination form extraction
        parsedData.rawHtml = response.data;
        // console.log(parsedData.rawHtml);
        return parsedData; // Return parsed data
      } catch (error) {
        if (
          error instanceof UnauthorizedException &&
          internalAuthRetryAttempt < this.authRetryLimit
        ) {
          this.logger.warn(
            `Erro de autenticação ao buscar página (Tentativa Chamador: ${callerAttemptNumber}, Retentativa Interna ${internalAuthRetryAttempt + 1}/${this.authRetryLimit + 1}). Invalidando auth e tentando novamente.`,
          );
          await this.invalidateAuth();
          internalAuthRetryAttempt++;
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * internalAuthRetryAttempt),
          ); // Backoff
        } else {
          this.logger.error(
            `Falha ao buscar/analisar página ${method} ${targetUrl} (Tentativa Chamador: ${callerAttemptNumber}) após ${internalAuthRetryAttempt + 1} retentativas internas: ${error.message}`,
            error.stack,
          );
          if (error instanceof HttpException) throw error; // Re-throw known HTTP errors
          throw new InternalServerErrorException(
            `Failed to process page ${method} ${targetUrl}: ${error.message}`,
          ); // Wrap unknown errors
        }
      }
    }
    // Should not be reached if error handling is correct
    throw new InternalServerErrorException(
      `Limite de retentativas internas de autenticação excedido ao buscar página ${method} ${targetUrl} (Tentativa Chamador: ${callerAttemptNumber})`,
    );
  }

  // Original fetchAndParse can now just use the helper
  async fetchAndParse(
    fetchParams: FetchSipacPageDto,
    parserKey: string,
    callerAttemptNumber: number = 1, // Adiciona o parâmetro aqui, começando em 1 por padrão
  ): Promise<any> {
    const parser = this.getParserByKey(parserKey); // Use a helper to get parser
    // Passa o número da tentativa do chamador para a função interna
    const result = await this._fetchAndParsePage(
      fetchParams,
      parser,
      callerAttemptNumber,
    );
    // Remove raw HTML before returning (se necessário)
    if (result && typeof result === 'object' && 'rawHtml' in result) {
      delete result.rawHtml;
    }

    //including more metadata (second update)
    result.metadata = {
      ...result.metadata,
      method: fetchParams.targetMethod,
      body: fetchParams.targetBody,
    };

    return result;
  }

  /**
   * Fetches all pages of a paginated list from SIPAC and aggregates the results.
   * Assumes the parser identified by parserKey returns pagination info under data.pagination.
   * @param initialFetchParams - DTO for the *first* page request.
   * @param parserKey - Key identifying the ListParserService.
   */
  async fetchAndParseList(
    initialFetchParams: FetchSipacPageDto,
    parserKey: string,
  ): Promise<any> {
    const listParser = this.getParserByKey(parserKey);

    // --- 1. Fetch and Parse First Page ---
    this.logger.log(
      `Fetching first page for list: ${initialFetchParams.targetMethod || 'GET'} ${initialFetchParams.targetUrl}`,
    );
    const firstPageResult = await this._fetchAndParsePage(
      initialFetchParams,
      listParser,
      1, // First attempt
    );

    // --- 2. Extract Pagination Info and Initial Items ---
    const pagination = firstPageResult?.data?.pagination;
    const allItems = firstPageResult?.data?.items || [];
    // Remove raw HTML, não é mais necessário aqui
    if (
      firstPageResult &&
      typeof firstPageResult === 'object' &&
      'rawHtml' in firstPageResult
    ) {
      delete firstPageResult.rawHtml;
    }

    // Verifica se a paginação foi retornada pelo parser
    if (!pagination) {
      this.logger.warn(
        `Pagination data not found in parser result for key '${parserKey}'. Assuming single page or parser issue.`,
      );
      return firstPageResult; // Retorna o resultado da primeira página
    }

    const totalPages = pagination.totalPages;

    // Verifica se há mais de uma página
    if (!totalPages || totalPages <= 1) {
      this.logger.log(
        `List has no pagination or only one page based on parser data. Total Pages: ${totalPages ?? 'N/A'}`,
      );
      return firstPageResult; // Retorna o resultado da primeira página
    }

    this.logger.log(
      `List has ${totalPages} pages. Fetching remaining pages using initial body parameters...`,
    );

    // --- 3. Prepare Base Parameters for Subsequent Requests ---
    const targetUrlForSubsequentPages = initialFetchParams.targetUrl;
    const methodForSubsequentPages = initialFetchParams.targetMethod;

    // Validação básica: Se for POST, precisa ter um corpo inicial
    if (methodForSubsequentPages === 'POST' && !initialFetchParams.targetBody) {
      this.logger.error(
        'Pagination requires POST method, but initialFetchParams.targetBody is missing.',
      );
      throw new InternalServerErrorException(
        'Cannot perform POST pagination without initial body parameters.',
      );
    }

    // Parse o corpo inicial para poder modificá-lo. Assume que é URLSearchParams string.
    // Se for outro formato (JSON?), ajuste aqui.
    const baseBodyParams = new URLSearchParams(
      initialFetchParams.targetBody || '',
    );

    // Identifique o nome do parâmetro da página. Pode ser 'pageNum', 'pagina', etc.
    // Vamos assumir 'pageNum' por enquanto, ajuste se necessário.
    const pageNumberParamName = 'pageNum'; // <-- AJUSTE AQUI se o nome for diferente (ex: 'pagina')

    // Verifica se o parâmetro de página existe no corpo inicial (opcional, mas bom para debug)
    if (
      !baseBodyParams.has(pageNumberParamName) &&
      methodForSubsequentPages === 'POST'
    ) {
      // Tenta verificar 'pagina' como alternativa comum
      if (baseBodyParams.has('pagina')) {
        // pageNumberParamName = 'pagina'; // Descomente se quiser usar 'pagina' automaticamente
        this.logger.warn(
          `Initial body has 'pagina' but not '${pageNumberParamName}'. Assuming 'pagina' is the page parameter.`,
        );
      } else {
        this.logger.warn(
          `Initial body for POST pagination does not contain the expected page parameter '${pageNumberParamName}'. Pagination might fail if this parameter is required. Body: ${baseBodyParams.toString()}`,
        );
      }
    }

    // --- 4. Loop Through Remaining Pages ---
    const maxPageRetries = 2;
    const retryDelayMs = 1500;

    for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
      this.logger.log(
        `Iniciando busca da página ${pageNum} de ${totalPages}...`,
      );

      // Cria uma *cópia* dos parâmetros base e atualiza o número da página
      const currentPageBodyParams = new URLSearchParams(
        baseBodyParams.toString(),
      );
      currentPageBodyParams.set(pageNumberParamName, pageNum.toString());
      // Se você sabe que 'pagina' também precisa ser atualizado, adicione:
      // if (currentPageBodyParams.has('pagina')) {
      //     currentPageBodyParams.set('pagina', pageNum.toString());
      // }

      const pageFetchParams: FetchSipacPageDto = {
        targetUrl: targetUrlForSubsequentPages,
        targetMethod: methodForSubsequentPages, // Usa o método original
        targetBody: currentPageBodyParams.toString(),
        // Usa a URL da *primeira* página como referer
        targetReferer: initialFetchParams.targetUrl,
      };

      let pageAttempt = 1;
      let success = false;
      while (pageAttempt <= maxPageRetries + 1 && !success) {
        try {
          this.logger.log(
            `Tentando buscar página ${pageNum} (Tentativa ${pageAttempt}/${maxPageRetries + 1})...`,
          );

          const currentPageResult = await this._fetchAndParsePage(
            pageFetchParams,
            listParser,
            pageAttempt,
          );
          // Remove raw HTML se existir
          if (
            currentPageResult &&
            typeof currentPageResult === 'object' &&
            'rawHtml' in currentPageResult
          ) {
            delete currentPageResult.rawHtml;
          }

          const currentPageItems = currentPageResult?.data?.items;

          if (Array.isArray(currentPageItems)) {
            allItems.push(...currentPageItems);
            this.logger.debug(
              `Adicionados ${currentPageItems.length} itens da página ${pageNum}. Total: ${allItems.length}`,
            );
          } else {
            this.logger.warn(
              `Nenhum item encontrado ou formato inesperado na página ${pageNum}.`,
            );
          }
          success = true;

          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          this.logger.warn(
            `Falha ao buscar/analisar página ${pageNum} na tentativa ${pageAttempt}: ${error.message}`,
          );

          if (pageAttempt > maxPageRetries) {
            this.logger.error(
              `Limite de retentativas (${maxPageRetries + 1}) atingido para a página ${pageNum}. Interrompendo paginação.`,
              error.stack,
            );
            throw new InternalServerErrorException(
              `Falha ao recuperar a página ${pageNum} da lista após ${pageAttempt} tentativas. Erro: ${error.message}`,
            );
          }

          pageAttempt++;
          const delay = retryDelayMs * (pageAttempt - 1);
          this.logger.log(
            `Aguardando ${delay}ms antes de tentar a página ${pageNum} novamente.`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // --- 5. Construct Final Result ---
    this.logger.log(
      `Finished fetching all ${totalPages} pages. Total items collected: ${allItems.length}`,
    );

    //including more metadata (second update)
    const finalResult = {
      metadata: {
        ...firstPageResult.metadata,
        method: initialFetchParams.targetMethod,
        body: initialFetchParams.targetBody,
      }, // Metadata from the first page
      data: {
        items: allItems, // Aggregated items
        pagination: pagination, // Pagination info from the first page (as returned by parser)
      },
    };

    return finalResult;
  }

  /**
   * Extracts hidden input data from a form within HTML content.
   * @param html - The raw HTML string.
   * @param formSelector - A CSS selector to find the form (e.g., 'form[name="buscaRequisicaoForm"]').
   * @returns A URLSearchParams object with the form data, or null if not found.
   */
  private _extractFormData(
    html: string,
    formSelector: string,
  ): URLSearchParams | null {
    try {
      const $: cheerio.Root = cheerio.load(html);
      const $form = $(formSelector).first();

      if ($form.length === 0) {
        this.logger.warn(
          `Form with selector '${formSelector}' not found in HTML.`,
        );
        return null;
      }

      const formData = new URLSearchParams();
      // Find all input elements within the form
      $form.find('input').each((i, elem) => {
        const $input = $(elem);
        const name = $input.attr('name');
        const value = $input.val();
        const type = $input.attr('type');

        // Include hidden inputs and potentially others if needed, exclude submit buttons for now
        if (
          name &&
          value !== undefined &&
          type !== 'submit' &&
          type !== 'button'
        ) {
          formData.append(name, value);
          // this.logger.debug(`Extracted form data: ${name}=${value}`);
        }
      });

      if (formData.toString() === '') {
        this.logger.warn(
          `No input fields found or extracted from form '${formSelector}'.`,
        );
        return null; // Return null if no data was actually extracted
      }

      return formData;
    } catch (error) {
      this.logger.error(
        `Error extracting form data with selector '${formSelector}': ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  // Helper to get parser and throw if not found
  private getParserByKey(parserKey: string): IHtmlParser {
    const selectedParser = this.parserMap.get(parserKey);
    if (!selectedParser) {
      this.logger.error(
        `Parser not found for key: '${parserKey}'. Available: [${Array.from(this.parserMap.keys()).join(', ')}]`,
      );
      throw new NotFoundException(
        `Configuration error: Parser service for key '${parserKey}' not found.`,
      );
    }
    this.logger.debug(`Using parser identified by key: '${parserKey}'`);
    return selectedParser;
  }

  // --- Helper Functions ---

  /** Extracts 'Set-Cookie' headers into an array of cookie strings (name=value part) */
  private extractCookies(headers: any): string[] {
    let cookies = headers['set-cookie'] || headers['Set-Cookie'];
    if (!cookies) {
      return [];
    }
    // Ensure it's always an array
    if (!Array.isArray(cookies)) {
      cookies = [cookies];
    }
    // Return only the part before the first semicolon, trimmed, and filter out empty strings
    return cookies
      .map((cookie: string) => cookie.split(';')[0].trim())
      .filter((c) => c);
  }

  /** Merges two cookie arrays, prioritizing the second array for duplicates based on cookie name (case-insensitive) */
  private mergeCookies(initial: string[], final: string[]): string[] {
    const cookieMap = new Map<string, string>();

    const addCookie = (cookie: string) => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        // Use lowercase name for case-insensitive comparison/overwrite
        const name = parts[0].trim().toLowerCase();
        // Store the original cookie string (with original casing)
        cookieMap.set(name, cookie);
      }
    };

    initial.forEach(addCookie);
    final.forEach(addCookie); // Overwrites initial cookies with the same name

    return Array.from(cookieMap.values());
  }

  /** Checks if AxiosResponse likely contains the CAS login page based on URL or content */
  private isLoginPage(response: AxiosResponse<unknown> | undefined): boolean {
    if (!response) return false;

    // Check final URL after potential redirects (accessing internal property)
    const finalUrl = (response.request?.res?.responseUrl as string) || '';
    // Does the final URL point back to the CAS server's login endpoint?
    const isCasUrl = finalUrl.includes('/sso-server/login');

    const html = response.data;
    if (typeof html !== 'string') {
      // If data isn't string, rely solely on the final URL check
      return isCasUrl;
    }

    // Check for specific CAS login page elements/text OR if the URL is the CAS login URL
    // This helps catch cases where SIPAC redirects back to CAS
    return (
      isCasUrl ||
      html.includes('input[name="lt"]') || // CAS hidden input
      html.includes('input[name="execution"]') || // CAS hidden input
      html.includes('id="msg.erro"') || // CAS error message div ID
      html.includes('Nome de Usuário') || // CAS login form label
      html.includes('Autenticação Integrada') // CAS page title/header
    );
  }
} // End of SipacService class
