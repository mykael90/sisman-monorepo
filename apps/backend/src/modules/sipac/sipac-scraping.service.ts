import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import pThrottle from 'p-throttle';
import sipacScrapingConfig from '../../config/sipac-scraping.config';

@Injectable()
export class SipacScrapingService implements OnModuleInit {
  private readonly logger = new Logger(SipacScrapingService.name);

  private throttler;
  private throttledDataRequest: <T = any>(
    config: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  constructor(
    private readonly httpService: HttpService,
    @Inject(sipacScrapingConfig.KEY)
    private apiConfig: ConfigType<typeof sipacScrapingConfig>
  ) {
    this.throttler = pThrottle({
      limit: 1,
      interval: Math.ceil(
        (3600 / Number(apiConfig.requestsPerHour)) * 1000 * 1.01
      )
    });

    this.throttledDataRequest = this.throttler(
      async <T = any>(
        config: AxiosRequestConfig
      ): Promise<AxiosResponse<T>> => {
        this.logger.debug(
          `Requesting data: ${config.method?.toUpperCase()} ${config.url}`
        );
        try {
          return await firstValueFrom(this.httpService.request<T>(config));
        } catch (error) {
          this.logger.error(
            `Erro durante requisição HTTP de dados para ${config.url}: ${error.message} ${error.code}`,
            error.stack
          );
          this.logger.error(error.code === 'ECONNREFUSED');
          if (error.response) {
            this.logger.error(
              `Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`
            );
          }

          // Captura erros de conexão, como o serviço estar offline
          if (error.code === 'ECONNREFUSED') {
            this.logger.error(
              `A conexão com o serviço em '${config.url}' foi recusada.`
            );
            const serviceUrl = new URL(config.url);
            throw new ServiceUnavailableException(
              `A conexão com o serviço em '${serviceUrl.host}' foi recusada. O serviço pode estar indisponível.`
            );
          }

          throw error;
        }
      }
    );
  }

  async onModuleInit() {
    this.logger.log(
      `SipacScrapingService initialized with API URL: ${this.apiConfig.apiUrl}`
    );
  }

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, any>,
    options?: Partial<AxiosRequestConfig> // Adiciona parâmetro para opções extras do Axios
  ): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.apiConfig.apiUrl}/${endpoint}`,
      headers: {
        Accept: 'application/json',
        ...headers
      },
      params,
      timeout: options?.timeout ?? 30000, // options: Define timeout como 30000ms (30 segundos) para esta chamada específica, mas permite sobrescrever com options
      ...options // Mescla as opções adicionais, como o timeout
    };
    return this.throttledDataRequest<T>(config);
  }
}
