import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import pThrottle from 'p-throttle'; // yarn add p-throttle ou npm install p-throttle
import sipacApiConfig from '../../config/sipac-api.config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string; // refresh_token pode ser opcional
  expires_in: number; // Segundos
  scope: string;
}

@Injectable()
export class SipacHttpService implements OnModuleInit {
  private readonly logger = new Logger(SipacHttpService.name);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;

  // Uma margem de segurança para renovar o token antes que ele expire.
  private readonly EXPIRY_BUFFER_MS = 60 * 1000; // 60 segundos de buffer para renovar antes de expirar

  private throttler;
  private tokenPromise: Promise<string> | null = null; // Para evitar múltiplas chamadas de token
  private throttledDataRequest: <T = any>(
    config: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  constructor(
    private readonly httpService: HttpService,
    @Inject(sipacApiConfig.KEY)
    private apiConfig: ConfigType<typeof sipacApiConfig>
  ) {
    // Configura o throttler: `requestsPerHour` chamadas por 1000ms*60s (1 hora)
    this.throttler = pThrottle({
      limit: apiConfig.requestsPerHour,
      interval: 1000 * 60
    });

    // Função throttled para fazer a requisição de DADOS
    this.throttledDataRequest = this.throttler(
      async <T = any>(
        config: AxiosRequestConfig
      ): Promise<AxiosResponse<T>> => {
        this.logger.debug(
          `Requesting data: ${config.method?.toUpperCase()} ${config.url}`
        );
        try {
          // O HttpService do NestJS aqui é usado para a chamada de dados,
          // poderia ser o mesmo HttpService injetado ou um novo, dependendo da preferência.
          // Para simplificar, usamos o mesmo injetado.
          return await firstValueFrom(this.httpService.request<T>(config));
        } catch (error) {
          this.logger.error(
            `Erro durante requisição HTTP de dados para ${config.url}: ${error.message}`,
            error.stack
          );
          if (error.response) {
            this.logger.error(
              `Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`
            );
          }
          throw error;
        }
      }
    );

    if (
      !this.apiConfig.tokenUrl ||
      !this.apiConfig.clientId ||
      !this.apiConfig.clientSecret
    ) {
      this.logger.error(
        'Configurações de autenticação do SIPAC (TOKEN_URL, CLIENT_ID, CLIENT_SECRET) não encontradas!'
      );
      // Você pode querer lançar um erro aqui para impedir a inicialização do módulo
    }
  }

  async onModuleInit() {
    // Opcional: tentar obter um token na inicialização para verificar a configuração
    // ou apenas deixar que a primeira chamada de API o faça.
    // try {
    //   await this.ensureValidToken();
    //   this.logger.log('Token inicial do SIPAC obtido com sucesso na inicialização.');
    // } catch (error) {
    //   this.logger.error('Falha ao obter token inicial do SIPAC na inicialização.', error.stack);
    // }
  }

  private isTokenValid(): boolean {
    return (
      !!this.accessToken &&
      this.expiresAt &&
      this.expiresAt.getTime() > Date.now() + this.EXPIRY_BUFFER_MS
    );
  }

  private async clientCredentialsFlow(): Promise<string> {
    this.logger.log('Obtendo novo access token via client credentials...');
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.apiConfig.clientId);
      params.append('client_secret', this.apiConfig.clientSecret);
      if (this.apiConfig.tokenScope) {
        params.append('scope', this.apiConfig.tokenScope);
      }

      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(this.apiConfig.tokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );

      this.storeTokenResponse(response.data);
      this.logger.log(
        'Novo access token obtido com sucesso (client credentials).'
      );
      return this.accessToken;
    } catch (error) {
      this.handleTokenError(error, 'client credentials');
      throw new Error('Falha ao obter token via client credentials.');
    }
  }

  private async refreshTokenFlow(): Promise<string> {
    if (!this.refreshToken) {
      this.logger.warn('Nenhum refresh token disponível para renovação.');
      throw new Error('Refresh token não disponível.');
    }

    this.logger.log('Tentando renovar access token usando refresh token...');
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.refreshToken);
      params.append('client_id', this.apiConfig.clientId); // Algumas APIs exigem client_id/secret no refresh
      params.append('client_secret', this.apiConfig.clientSecret);

      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(this.apiConfig.tokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );

      this.storeTokenResponse(response.data);
      this.logger.log('Access token renovado com sucesso.');
      return this.accessToken;
    } catch (error) {
      this.handleTokenError(error, 'refresh token');
      this.logger.warn(
        'Falha ao renovar token. O refresh token pode ter expirado ou sido revogado.'
      );
      this.refreshToken = null; // Invalida o refresh token problemático
      this.accessToken = null; // Garante que o próximo passo seja client_credentials
      this.expiresAt = null;
      throw new Error('Falha ao renovar token.');
    }
  }

  private storeTokenResponse(data: TokenResponse): void {
    this.accessToken = data.access_token;
    // Algumas APIs não retornam um novo refresh token a cada renovação.
    // Se não vier, mantenha o antigo, a menos que a renovação tenha falhado.
    this.refreshToken = data.refresh_token || this.refreshToken;
    this.expiresAt = new Date(Date.now() + data.expires_in * 1000);
    this.logger.debug(
      `Token armazenado. Expira em: ${this.expiresAt.toISOString()}`
    );
  }

  private handleTokenError(error: any, flowType: string): void {
    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Erro na requisição de token (${flowType}): ${axiosError.message}`,
        `Status: ${axiosError.response?.status}, Data: ${JSON.stringify(axiosError.response?.data)}`
      );
    } else {
      this.logger.error(
        `Erro inesperado durante ${flowType}: ${error.message}`,
        error.stack
      );
    }
  }

  // Lógica para garantir um token válido, lidando com concorrência
  private async ensureValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.accessToken;
    }

    // Se já existe uma promessa de obtenção de token, aguarde-a
    if (this.tokenPromise) {
      this.logger.debug('Requisição de token já em andamento. Aguardando...');
      return this.tokenPromise;
    }

    this.logger.log(
      'Token inválido ou expirado. Iniciando processo de obtenção/renovação.'
    );
    // Cria a promessa de obtenção/renovação
    this.tokenPromise = (async () => {
      try {
        if (this.refreshToken) {
          this.logger.debug('Tentando refresh token flow...');
          return await this.refreshTokenFlow();
        }
      } catch (refreshError) {
        this.logger.warn(
          `Refresh token flow falhou: ${refreshError.message}. Tentando client credentials flow.`
        );
        // A falha no refreshTokenFlow já limpa o refreshToken se necessário
      }

      // Se não há refresh token ou a renovação falhou, tenta client credentials
      this.logger.debug('Tentando client credentials flow...');
      return await this.clientCredentialsFlow();
    })().finally(() => {
      // Limpa a promessa após ser resolvida ou rejeitada,
      // permitindo que novas tentativas de obtenção de token ocorram se necessário.
      this.tokenPromise = null;
    });

    return this.tokenPromise;
  }

  // Método genérico GET para DADOS
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, any> // Adiciona o novo parâmetro headers
  ): Promise<AxiosResponse<T>> {
    const token = await this.ensureValidToken(); // Garante que temos um token válido

    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.apiConfig.apiUrl}/${endpoint}`, // Usa apiUrl para dados
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-API-Key': this.apiConfig.xApiKey, // Adiciona o X-API-Key
        ...headers // Mescla os headers fornecidos, sobrescrevendo se houver conflito
      },
      params
    };
    return this.throttledDataRequest<T>(config); // Usa o throttler para chamadas de DADOS
  }

  // Outros métodos (POST, PUT, etc.) para DADOS seguiriam o mesmo padrão:
  // async post<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  //   const token = await this.ensureValidToken();
  //   const config: AxiosRequestConfig = {
  //     method: 'POST',
  //     url: `${this.apiBaseUrl}/${endpoint}`,
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     data,
  //   };
  //   return this.throttledDataRequest<T>(config);
  // }
}
