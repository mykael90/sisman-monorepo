// src/shared/observability/metrics.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge, // Adicionado Gauge para a nova métrica
  register // Usa o registro global padrão do prom-client
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly serviceName = 'sisman_api'; // Coloque um nome relevante para sua aplicação

  // Métricas HTTP
  public readonly httpRequestCounter: Counter<string>;
  public readonly httpRequestDurationHistogram: Histogram<string>;

  // Métrica de Login
  public readonly userLoginCounter: Counter<string>;
  // Métrica de Registro de Usuário
  public readonly userRegisteredCounter: Counter<string>;
  // Métrica de Usuários Ativos nas Últimas 24 Horas
  public readonly activeUsersLast24Hours: Gauge<string>;

  // Estrutura para armazenar atividades de usuários: { userId: string, timestamp: number }
  private userActivity: { userId: string; timestamp: number }[] = [];
  private readonly TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

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
      registers: [register]
    });
    this.logger.log('HTTP Request Counter registered.');

    // --- Métrica: Histograma de Duração das Requisições HTTP ---
    this.httpRequestDurationHistogram = new Histogram({
      name: `${this.serviceName}_http_request_duration_seconds`,
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Buckets em segundos (ajuste conforme necessário)
      registers: [register]
    });
    this.logger.log('HTTP Request Duration Histogram registered.');

    // --- Métrica: Contador de Logins de Usuário Bem-sucedidos ---
    this.userLoginCounter = new Counter({
      name: `${this.serviceName}_user_logins_total`,
      help: 'Total number of successful user logins',
      // Pode adicionar labels se tiver diferentes tipos de login (ex: 'type: password', 'type: google')
      // labelNames: ['type'],
      registers: [register]
    });
    this.logger.log('User Login Counter registered.');

    // --- Métrica: Contador de Registros de Usuário Bem-sucedidos ---
    this.userRegisteredCounter = new Counter({
      name: `${this.serviceName}_user_registered_total`,
      help: 'Total number of successful user registrations',
      registers: [register]
    });
    this.logger.log('User Registered Counter registered.');

    // --- Métrica: Usuários Ativos nas Últimas 24 Horas ---
    this.activeUsersLast24Hours = new Gauge({
      name: `${this.serviceName}_active_users_last_24_hours`,
      help: 'Number of unique active users in the last 24 hours',
      collect: () => {
        // Esta função é chamada quando as métricas são coletadas
        const uniqueUsers = this.getUniqueUsersLast24Hours();
        this.activeUsersLast24Hours.set(uniqueUsers);
      },
      registers: [register]
    });
    this.logger.log('Active Users Last 24 Hours Gauge registered.');

    this.logger.log('Metrics Service Initialized.');
  }

  /**
   * Registra a atividade de um usuário.
   * @param userId O ID do usuário que realizou a requisição.
   */
  recordUserActivity(userId: string): void {
    const now = Date.now();
    // Adiciona a atividade. Pode ser otimizado para evitar duplicatas recentes se necessário,
    // mas para a contagem de 24h, múltiplas entradas do mesmo usuário são filtradas depois.
    this.userActivity.push({ userId, timestamp: now });

    // Opcional: Limpar atividades muito antigas para evitar que o array cresça indefinidamente.
    // Isso pode ser feito periodicamente ou antes de cada cálculo.
    this.cleanOldUserActivity();
  }

  /**
   * Calcula o número de usuários únicos nas últimas 24 horas.
   * @returns O número de usuários únicos.
   */
  getUniqueUsersLast24Hours(): number {
    this.cleanOldUserActivity(); // Garante que apenas atividades recentes sejam consideradas

    const twentyFourHoursAgo = Date.now() - this.TWENTY_FOUR_HOURS_IN_MS;
    const recentActivities = this.userActivity.filter(
      (activity) => activity.timestamp >= twentyFourHoursAgo
    );

    const uniqueUserIds = new Set(
      recentActivities.map((activity) => activity.userId)
    );

    return uniqueUserIds.size;
  }

  /**
   * Remove atividades de usuário mais antigas que 24 horas.
   * Chamado antes de calcular a métrica para manter a lista relevante.
   */
  private cleanOldUserActivity(): void {
    const twentyFourHoursAgo = Date.now() - this.TWENTY_FOUR_HOURS_IN_MS;
    this.userActivity = this.userActivity.filter(
      (activity) => activity.timestamp >= twentyFourHoursAgo
    );
  }

  get registry(): Registry {
    return register;
  }
}
