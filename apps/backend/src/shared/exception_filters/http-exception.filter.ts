// src/common/filters/http-exception.filter.ts (ou onde estiver seu filtro)
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable, // Importe Injectable
  Scope, // Importe Scope se quiser request-scoped (geralmente não necessário aqui)
  HttpStatus, // Importe HttpStatus
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogErrorService } from '../log-error/log-error.service';
import { Prisma } from '@sisman/prisma';

@Catch(HttpException)
@Injectable() // Torne o filtro injetável
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // Injete o serviço de log
  constructor(private readonly errorLogService: LogErrorService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.log('HttpExceptionFilter triggered');

    // Marque como async
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message || exception.message; // Tenta pegar a mensagem de forma mais robusta

    const errorLogData: Prisma.LogErrorCreateInput = {
      timestamp: new Date(),
      statusCode: status,
      path: request.url,
      method: request.method,
      message: errorMessage,
      stackTrace: exception.stack,
      ipAddress: request.ip,
      userId: request.user?.id, // Descomente e ajuste se tiver autenticação e o user no request
      requestBody: JSON.stringify(request.body), // CUIDADO: Pode conter dados sensíveis (senhas, etc). Considere sanitizar/omitir.
    };

    // Loga o erro no banco de dados de forma assíncrona
    // Não usamos await aqui para não bloquear a resposta ao cliente,
    // mas garantimos que o erro interno do log seja tratado no service.
    this.errorLogService.createLog(errorLogData).catch((err) => {
      // Log adicional no console caso a promise rejeite (embora o service já tenha um catch)
      this.logger.error('Error logging failed unexpectedly in filter:', err);
    });

    // Lógica original para enviar a resposta ao cliente
    let responseBody: any;
    if (typeof exceptionResponse === 'string') {
      responseBody = {
        statusCode: status,
        error: exceptionResponse, // Use a string original como mensagem de erro
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else if (typeof exceptionResponse === 'object') {
      responseBody = {
        ...(exceptionResponse as object), // Espalha a resposta original da exceção
        timestamp: new Date().toISOString(),
        path: request.url,
      };
      // Garante que statusCode esteja presente, caso o objeto de resposta não o tenha
      if (!responseBody.statusCode) {
        responseBody.statusCode = status;
      }
    } else {
      // Fallback caso getResponse() retorne algo inesperado
      responseBody = {
        statusCode: status,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    response.status(status).json(responseBody);
  }
}
