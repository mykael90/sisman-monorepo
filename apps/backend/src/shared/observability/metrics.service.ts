// src/shared/observability/metrics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  register, // Usa o registro global padrão do prom-client
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly serviceName = 'my_nestjs_app'; // Coloque um nome relevante para sua aplicação

  // Métricas HTTP
  public readonly httpRequestCounter: Counter<string>;
  public readonly httpRequestDurationHistogram: Histogram<string>;

  // Métrica de Login
  public readonly userLoginCounter: Counter<string>;

  constructor() {
    this.logger.log('Initializing Metrics Service...');

    // Limpa o registro caso haja recarregamento em dev (hot-reload)
    register.clear();

    // Registra métricas padrão do Node.js (CPU, Memória, etc.) - Opcional mas recomendado
    collectDefaultMetrics({ register });
    this.logger.log('Default Node.js metrics registered.');

    // --- Métrica: Contador Total de Requisições HTTP ---
    this.httpRequestCounter = new Counter({
      name: `${this.serviceName}_http_requests_total`,
      help: 'Total number of HTTP requests handled',
      labelNames: ['method', 'route', 'status_code'], // Labels para detalhamento
      registers: [register],
    });
    this.logger.log('HTTP Request Counter registered.');

    // --- Métrica: Histograma de Duração das Requisições HTTP ---
    this.httpRequestDurationHistogram = new Histogram({
      name: `${this.serviceName}_http_request_duration_seconds`,
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Buckets em segundos (ajuste conforme necessário)
      registers: [register],
    });
    this.logger.log('HTTP Request Duration Histogram registered.');

    // --- Métrica: Contador de Logins de Usuário Bem-sucedidos ---
    this.userLoginCounter = new Counter({
      name: `${this.serviceName}_user_logins_total`,
      help: 'Total number of successful user logins',
      // Pode adicionar labels se tiver diferentes tipos de login (ex: 'type: password', 'type: google')
      // labelNames: ['type'],
      registers: [register],
    });
    this.logger.log('User Login Counter registered.');

    this.logger.log('Metrics Service Initialized.');
  }

  get registry(): Registry {
    return register;
  }
}
