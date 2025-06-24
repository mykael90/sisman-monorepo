import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SipacService, TargetSystem } from '../sipac.service';
import { Axios, AxiosResponse } from 'axios';
import { AxiosError } from 'axios'; // Import AxiosError
import { firstValueFrom, catchError } from 'rxjs'; // Import catchError
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageParserService {
  private readonly logger = new Logger(ImageParserService.name);
  private readonly baseSipacUrl: string;

  private readonly authRetryLimit: number; // Get from config, similar to SipacService

  constructor(
    private readonly httpService: HttpService,
    private readonly sipacService: SipacService,
    private readonly configService: ConfigService,
  ) {
    this.baseSipacUrl = this.configService.getOrThrow<string>('BASE_SIPAC_URL');
    this.authRetryLimit = this.configService.get<number>('AUTH_RETRY_LIMIT', 2); // Use the same limit
  }

  async getImageBlob(url: string, referer?: string): Promise<Blob> {
    let internalAuthRetryAttempt = 0; // Similar to _fetchAndParsePage

    while (internalAuthRetryAttempt <= this.authRetryLimit) {
      // Loop de retentativa
      try {
        this.logger.log(
          `Fetching image from ${url} (Attempt ${internalAuthRetryAttempt + 1}/${this.authRetryLimit + 1})`,
        );
        const cookies = await this.sipacService.getAuthCookies('sigaa'); // Pass retry attempt

        this.logger.log(JSON.stringify(cookies));

        const commonHeaders = {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', // Use a real user agent
          Cookie: cookies.join('; '),
          Referer:
            referer ||
            this.baseSipacUrl + '/sipac/portal_administrativo/index.jsf',
          Host: new URL(url).hostname, // Host dinâmico baseado na URL do arquivo
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8', // Accept image types
          'Accept-Language': 'pt,pt-BR;q=0.9,en;q=0.8',
          Connection: 'keep-alive',
          'Sec-Fetch-Dest': 'image', // Correct fetch dest for images
          'Sec-Fetch-Mode': 'no-cors', // Images often fetched without CORS
          'Sec-Fetch-Site': 'same-origin',
          Origin: this.baseSipacUrl,
        };

        const response: AxiosResponse<ArrayBuffer> = await firstValueFrom(
          this.httpService
            .get(url, {
              headers: commonHeaders, // No need for 'Content-Type' for GET image
              responseType: 'arraybuffer', // Mantém arraybuffer para dados de imagem
              validateStatus: (status) => status >= 200 && status < 500, // Aceita 4xx para verificar página de login
            })
            .pipe(
              catchError((error: AxiosError) => {
                this.logger.error(
                  `AxiosError during image fetch from ${url}: ${error.message}`,
                );
                // Verifica se a resposta de erro indica uma página de login
                if (
                  error.response &&
                  this.isLoginPageFromAxiosResponse(error.response)
                ) {
                  this.logger.warn(
                    `Image fetch received login page as error response. Invalidating auth and retrying.`,
                  );
                  throw new Error('SESSION_EXPIRED_RETRY'); // Custom error to trigger retry
                }
                throw error; // Re-throw other errors
              }),
            ),
        );

        this.logger.debug(`Response status: ${response.status}`);
        this.logger.debug(
          `Response headers: ${JSON.stringify(response.headers)}`,
        );

        const contentType = response.headers['content-type'];

        if (!contentType) {
          throw new Error('Content type not found in response headers');
        }

        // Verifica se uma resposta 200 OK é na verdade uma página de login (ex: servidor envia HTML com status 200)
        if (
          contentType.includes('text/html')
          //TODO: mesmo quando expira não está funcionando. Precisa ajustar esse método isLoginPageFromAxiosResponse
          // && this.isLoginPageFromAxiosResponse(response)
        ) {
          this.logger.warn(
            `Image fetch received login page as 200 OK response. Invalidating auth and retrying.`,
          );
          throw new Error('SESSION_EXPIRED_RETRY'); // Custom error to trigger retry
        }

        this.logger.debug(`Content type: ${contentType}`);
        const buffer = Buffer.from(response.data);
        const blob = new Blob([buffer], { type: contentType });
        return blob; // Success, break loop and return
      } catch (error) {
        if (error.message === 'SESSION_EXPIRED_RETRY') {
          // Captura o erro customizado
          await this.sipacService.invalidateAuth();
          internalAuthRetryAttempt++;
          if (internalAuthRetryAttempt > this.authRetryLimit) {
            this.logger.error(
              `Authentication retry limit (${this.authRetryLimit}) reached for image fetch.`,
            );
            throw new Error('Authentication failed after multiple retries.');
          }
          await new Promise(
            (
              resolve, // Backoff para evitar loop rápido
            ) => setTimeout(resolve, 1000 * internalAuthRetryAttempt),
          ); // Backoff
        } else {
          this.logger.error(
            `Error fetching image from ${url} after ${internalAuthRetryAttempt + 1} attempts: ${error.message}`,
            error.stack,
          );
          throw error; // Re-throw original error
        }
      }
    }
    // Should not be reached
    throw new Error(
      'Unexpected error: Image fetch loop exited without result.',
    );
  }

  /**
   * Helper to check if an AxiosResponse (which might have ArrayBuffer data)
   * contains login page content.
   * This will attempt to decode the ArrayBuffer if content-type is text/html.
   */
  private isLoginPageFromAxiosResponse(
    response: AxiosResponse<unknown>,
  ): boolean {
    // Primeiro, verifica a URL final (menos confiável para imagens, mas bom como primeira verificação)
    const finalUrl = (response.request?.res?.responseUrl as string) || '';
    const isCasUrl = finalUrl.includes('/sso-server/login');
    if (isCasUrl) {
      this.logger.debug(`isLoginPage: URL indicates CAS login: ${finalUrl}`);
      return true;
    }

    // Se o content-type não for HTML, é improvável que seja uma página de login
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      this.logger.debug(
        `isLoginPage: Content-Type is not HTML: ${contentType}`,
      );
      return false;
    }

    // Tenta decodificar os dados do ArrayBuffer para string para verificar o conteúdo
    let htmlContent: string | undefined;
    if (response.data instanceof ArrayBuffer) {
      try {
        // Assumindo ISO-8859-1 para páginas HTML do SIPAC
        const decoder = new TextDecoder('iso-8859-1'); // SIPAC often uses latin1
        htmlContent = decoder.decode(response.data);
        this.logger.debug(
          `isLoginPage: Decoded ArrayBuffer to string. Excerpt: ${htmlContent.substring(0, 200)}...`,
        );
      } catch (decodeError) {
        this.logger.warn(
          `isLoginPage: Failed to decode ArrayBuffer to string for login page check: ${decodeError.message}`,
        );
        return false; // Cannot check content if decoding fails
      }
    } else if (typeof response.data === 'string') {
      htmlContent = response.data;
      this.logger.debug(
        `isLoginPage: Data is already string. Excerpt: ${htmlContent.substring(0, 200)}...`,
      );
    }

    if (!htmlContent) {
      this.logger.debug(`isLoginPage: No HTML content to check.`);
      return false;
    }

    // Now check for specific CAS login page elements/text
    const isLoginPageContent =
      htmlContent.includes('input[name="lt"]') || // CAS hidden input
      htmlContent.includes('input[name="execution"]') || // CAS hidden input
      htmlContent.includes('id="msg.erro"') || // CAS error message div ID
      htmlContent.includes('Nome de Usuário') || // CAS login form label
      htmlContent.includes('Autenticação Integrada') || // CAS page title/header
      htmlContent.includes('Sua sessão foi expirada'); // Specific message from the user's error

    this.logger.debug(
      `isLoginPage: Content check result: ${isLoginPageContent}`,
    );
    return isLoginPageContent;
  }
}
