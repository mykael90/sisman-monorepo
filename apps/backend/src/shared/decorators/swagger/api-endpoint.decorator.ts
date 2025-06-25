// src/common/decorators/api-endpoint.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath
} from '@nestjs/swagger';

interface ApiEndpointOptions {
  summary: string;
  description?: string;
  response: {
    status: number;
    description: string;
    type?: Type<any>; // O DTO de resposta
    content?: any;
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
    { status: 500, description: 'Erro interno do servidor' }
  ];

  const allErrors = [...defaultErrors, ...errors].map((err) =>
    ApiResponse({ status: err.status, description: err.description })
  );

  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({
      status: response.status,
      description: response.description,
      content: response.content,
      type: response.type
    }),
    ...allErrors
  );
}
