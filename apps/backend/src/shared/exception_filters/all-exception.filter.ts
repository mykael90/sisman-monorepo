// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogErrorService } from '../log-error/log-error.service';
import { Prisma } from '@sisman/prisma'; // Supondo que @sisman/prisma é seu cliente Prisma gerado

@Catch() // Captura TUDO
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly logErrorService: LogErrorService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    this.logger.log('AllExceptionsFilter triggered');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();

    let status: number;
    let messageForLog: string;
    let clientResponseBody: any;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      // É uma HttpException, aplicar lógica similar ao HttpExceptionFilter
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse(); // Pode ser string ou objeto
      stack = exception.stack;

      if (typeof exceptionResponse === 'string') {
        messageForLog = exceptionResponse;
        clientResponseBody = {
          statusCode: status,
          message: exceptionResponse, // Manter como 'message' por consistência
          error: HttpStatus[status] || 'Error',
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const exceptionResponseMessage = (exceptionResponse as any).message;

        if (Array.isArray(exceptionResponseMessage)) {
          messageForLog = exceptionResponseMessage.join('; '); // Para o log no DB
        } else if (typeof exceptionResponseMessage === 'string') {
          messageForLog = exceptionResponseMessage;
        } else {
          messageForLog = exception.message || JSON.stringify(exceptionResponse);
        }

        clientResponseBody = {
          ...(exceptionResponse as object),
          timestamp: new Date().toISOString(),
          path: request.url,
        };
        if (!clientResponseBody.statusCode) {
          clientResponseBody.statusCode = status;
        }
        if (!clientResponseBody.error && status >= 400) {
            clientResponseBody.error = HttpStatus[status] || 'Error';
        }
      } else {
        // Fallback caso getResponse() de HttpException retorne algo inesperado
        messageForLog = exception.message;
        clientResponseBody = {
          statusCode: status,
          message: exception.message,
          error: HttpStatus[status] || 'Error',
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }
    } else {
      // Não é uma HttpException, tratar como erro interno do servidor
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      stack = exception instanceof Error ? exception.stack : undefined;

      // Para o log, tentamos obter uma mensagem útil
      if (exception instanceof Error) {
        messageForLog = exception.message;
      } else if (typeof exception === 'string') {
        messageForLog = exception;
      } else {
        // Tenta serializar se for um objeto, caso contrário, mensagem genérica
        try {
          messageForLog = JSON.stringify(exception);
        } catch (e) {
          messageForLog = 'An unexpected error occurred, and it could not be serialized.';
        }
      }
      // Adiciona um prefixo para clareza no log, já que a origem é desconhecida
      messageForLog = `[Non-HttpException]: ${messageForLog}`;


      // Para o cliente, NUNCA exponha detalhes de erros não-HttpException
      clientResponseBody = {
        statusCode: status,
        message: 'Internal Server Error', // Mensagem genérica e segura
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      // Logar o erro completo no console para visibilidade imediata
      // já que é um erro inesperado
      this.logger.error(
        `[AllExceptionsFilter] Unexpected non-HttpException caught for path ${request.url}:`,
        exception, // Loga o objeto/valor da exceção original
        stack      // Loga o stack se disponível
      );
    }

    const errorLogData: Prisma.LogErrorCreateInput = {
      timestamp: new Date(),
      statusCode: status,
      path: request.url,
      method: request.method,
      message: messageForLog, // messageForLog é garantidamente uma string
      stackTrace: stack,
      ipAddress: request.ip,
      userId: request.user?.id,
      requestBody: JSON.stringify(request.body), // CUIDADO: Dados sensíveis!
    };

    this.logErrorService.createLog(errorLogData).catch((err) => {
      this.logger.error(
        `Error logging failed unexpectedly in AllExceptionsFilter for path: ${request.url}`,
        err.stack, // Loga o stack do erro de log
        JSON.stringify(errorLogData) // Loga os dados que falharam ao serem salvos
      );
    });

    response.status(status).json(clientResponseBody);
  }
}