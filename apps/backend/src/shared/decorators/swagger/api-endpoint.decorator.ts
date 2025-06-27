// src/common/decorators/api-endpoint.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath // Importante para a referência do schema
} from '@nestjs/swagger';

interface ApiEndpointOptions {
  summary: string;
  description?: string;
  response: {
    status: number;
    description: string;
    type?: Type<any>;
    isArray?: boolean;
    content?: ApiResponseOptions['content'];
  };
  errors?: {
    status: number;
    description: string;
  }[];
}

export function ApiEndpointSwagger(options: ApiEndpointOptions) {
  const { summary, description, response, errors = [] } = options;

  const defaultErrors = [
    { status: 400, description: 'Requisição inválida (Bad Request)' },
    { status: 401, description: 'Não autorizado' },
    { status: 403, description: 'Acesso negado' },
    { status: 500, description: 'Erro interno do servidor' }
  ];

  const allErrors = [...defaultErrors, ...errors].map((err) =>
    ApiResponse({ status: err.status, description: err.description })
  );

  // Construir a configuração da resposta de sucesso
  const successResponseOptions: ApiResponseOptions = {
    status: response.status,
    description: response.description
  };

  // Lógica de Priorização Corrigida:
  if (response.content) {
    // 1. Se 'content' for fornecido, ele tem prioridade máxima.
    successResponseOptions.content = response.content;
  } else if (response.type) {
    // 2. Senão, se 'type' for fornecido, construímos a resposta.
    if (response.isArray) {
      // CORREÇÃO AQUI: Para arrays, construímos o 'content' manualmente.
      successResponseOptions.content = {
        'application/json': {
          // Assumindo que a resposta é sempre JSON
          schema: {
            type: 'array',
            items: { $ref: getSchemaPath(response.type) }
          }
        }
      };
    } else {
      // Para objetos únicos, o atalho 'type' funciona perfeitamente.
      successResponseOptions.type = response.type;
    }
  }

  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse(successResponseOptions),
    ...allErrors
  );
}
