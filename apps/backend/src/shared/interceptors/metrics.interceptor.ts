// src/shared/interceptors/metrics.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../observability/metrics.service'; // Ajuste o caminho
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpException } from '@nestjs/common';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx: HttpArgumentsHost = context.switchToHttp();
    const request: Request = ctx.getRequest<Request>();
    const response: Response = ctx.getResponse<Response>();
    const startTime = Date.now(); // Ou performance.now() para maior precisão

    return next.handle().pipe(
      tap(() => {
        // Executa em caso de sucesso
        const duration = (Date.now() - startTime) / 1000; // Duração em segundos
        const route = request.route?.path ?? request.url; // Tenta pegar o padrão da rota, senão usa URL
        const statusCode = response.statusCode;

        this.metricsService.httpRequestCounter.inc({
          method: request.method,
          route: route,
          status_code: statusCode,
        });

        this.metricsService.httpRequestDurationHistogram.observe(
          {
            method: request.method,
            route: route,
            status_code: statusCode,
          },
          duration,
        );
      }),
      catchError((err) => {
        // Executa em caso de erro
        const duration = (Date.now() - startTime) / 1000; // Duração em segundos
        const route = request.route?.path ?? request.url;
        const statusCode = err instanceof HttpException ? err.getStatus() : 500; // Pega status do erro ou assume 500

        this.metricsService.httpRequestCounter.inc({
          method: request.method,
          route: route,
          status_code: statusCode,
        });

        this.metricsService.httpRequestDurationHistogram.observe(
          {
            method: request.method,
            route: route,
            status_code: statusCode,
          },
          duration,
        );
        // Re-lança o erro para que outros handlers (como seus filtros de exceção) o peguem
        return throwError(() => err);
      }),
    );
  }
}
