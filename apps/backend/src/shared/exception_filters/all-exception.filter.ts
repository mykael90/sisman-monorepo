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

@Catch() // <-- Captura TUDO que não foi pego antes
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly logErrorService: LogErrorService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    this.logger.log('AllExceptionsFilter triggered');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();

    // Determina o status e a mensagem
    // Se for uma HttpException que escapou (improvável se HttpExceptionFilter estiver antes), use seus dados.
    // Senão, é um erro inesperado, use 500.
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message // Ou exception.getResponse() dependendo do que você quer logar
        : exception instanceof Error // Verifica se é uma instância de Error para pegar a mensagem
          ? exception.message
          : 'Internal server error'; // Mensagem genérica para outros tipos de throws

    const stack = exception instanceof Error ? exception.stack : undefined;

    const logMessage =
      exception instanceof HttpException
        ? JSON.stringify(exception.getResponse()) // Loga a resposta estruturada da HttpException
        : message; // Loga a mensagem de erro para outros tipos

    // Prepara os dados para o log no banco
    const errorLogData: Prisma.LogErrorCreateInput = {
      timestamp: new Date(),
      statusCode: status,
      path: request.url,
      method: request.method,
      message: logMessage, // Usa a mensagem determinada acima
      stackTrace: stack,
      ipAddress: request.ip,
      userId: request.user?.id, // Descomente e ajuste se tiver autenticação
      requestBody: JSON.stringify(request.body), // CUIDADO: Dados sensíveis! Considere sanitizar/omitir.
    };

    // Loga o erro no banco de dados (sem bloquear a resposta)
    this.logErrorService.createLog(errorLogData).catch((err) => {
      this.logger.error(
        'Error logging failed unexpectedly in AllExceptionsFilter:',
        err,
      );
    });

    // Prepara a resposta para o cliente (NUNCA exponha o stack trace ou detalhes internos no erro 500)
    const responseBody = {
      statusCode: status,
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal Server Error' // Mensagem genérica e segura para o cliente
          : message, // Se for uma HttpException que passou, use a mensagem dela
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(responseBody);

    // Opcional: Logar o erro completo no console para visibilidade imediata no desenvolvimento/servidor
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[AllExceptionsFilter] Unexpected error caught:`,
        exception,
      );
    }
  }
}
