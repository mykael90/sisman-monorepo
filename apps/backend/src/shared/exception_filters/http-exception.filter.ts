// src/common/filters/http-exception.filter.ts
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

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly errorLogService: LogErrorService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.log('HttpExceptionFilter triggered');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse(); // Pode ser string ou objeto

    let messageForLog: string;
    let clientResponseBody: any;

    if (typeof exceptionResponse === 'string') {
      // Ex: new HttpException('Acesso negado', HttpStatus.FORBIDDEN)
      // exceptionResponse é "Acesso negado"
      messageForLog = exceptionResponse;
      clientResponseBody = {
        statusCode: status,
        message: exceptionResponse, // Manter como 'message' por consistência
        error: HttpStatus[status] || 'Error', // Adiciona um título de erro genérico se não houver
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // Ex: Erros de validação do class-validator, ou um objeto customizado
      // exceptionResponse pode ser { message: ["err1", "err2"], error: "Bad Request", statusCode: 400 }
      // ou { message: "Erro singular", error: "Bad Request", statusCode: 400 }
      // ou um objeto customizado { customError: "detail", code: "X123" }

      const exceptionResponseMessage = (exceptionResponse as any).message;

      if (Array.isArray(exceptionResponseMessage)) {
        // Caso específico de array de mensagens (ex: class-validator)
        messageForLog = exceptionResponseMessage.join('; '); // Para o log no DB
      } else if (typeof exceptionResponseMessage === 'string') {
        // Caso de mensagem string dentro do objeto de resposta
        messageForLog = exceptionResponseMessage;
      } else {
        // Se 'message' não existe ou não é string/array,
        // tenta usar a mensagem da exceção raiz ou serializa o objeto de resposta inteiro.
        // Isso pode acontecer se a exceção for lançada com um objeto que não segue o padrão { message: '...' }
        // ex: new HttpException({ error_code: 123, description: 'details'}, HttpStatus.BAD_REQUEST)
        messageForLog = exception.message || JSON.stringify(exceptionResponse);
      }

      // Para a resposta ao cliente, tentamos manter a estrutura original o máximo possível
      clientResponseBody = {
        ...(exceptionResponse as object), // Espalha a resposta original
        timestamp: new Date().toISOString(), // Garante timestamp
        path: request.url, // Garante path
      };

      // Garante que statusCode esteja presente, caso o objeto de resposta não o tenha
      if (!clientResponseBody.statusCode) {
        clientResponseBody.statusCode = status;
      }
      // Se o objeto de resposta original não tiver um campo 'error' (comum para erros HTTP),
      // adiciona um baseado no status.
      if (!clientResponseBody.error && status >= 400) {
        clientResponseBody.error = HttpStatus[status] || 'Error';
      }
    } else {
      // Fallback: se exceptionResponse não for string nem objeto (improvável com HttpException)
      messageForLog = exception.message;
      clientResponseBody = {
        statusCode: status,
        message: exception.message,
        error: HttpStatus[status] || 'Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    const errorLogData: Prisma.LogErrorCreateInput = {
      timestamp: new Date(),
      statusCode: status,
      path: request.url,
      method: request.method,
      message: messageForLog, // Aqui messageForLog é sempre uma string
      stackTrace: exception.stack,
      ipAddress: request.ip,
      userId: request.user?.id,
      requestBody: JSON.stringify(request.body), // CUIDADO com dados sensíveis
    };

    this.errorLogService.createLog(errorLogData).catch((err) => {
      this.logger.error(
        `Error logging failed unexpectedly in filter for path: ${request.url}`,
        err.stack, // Loga o stack do erro de log
        JSON.stringify(errorLogData) // Loga os dados que falharam ao serem salvos
      );
    });

    response.status(status).json(clientResponseBody);
  }
}