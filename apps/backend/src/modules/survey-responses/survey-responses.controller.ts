import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';

import { SurveyResponsesService } from './survey-responses.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  CreateSurveyResponseDto,
  SurveyResponseWithRelationsResponseDto
} from './dto/survey-responses.dto';

@UseGuards(AuthGuard, RoleGuard)
@Controller('survey-response')
@ApiTags('survey-response')
export class SurveyResponsesController {
  constructor(
    private readonly surveyResponsesService: SurveyResponsesService
  ) {}

  /**
   * Cria uma nova resposta de pesquisa.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova resposta de pesquisa',
    description:
      'Cria uma nova resposta de pesquisa com as respostas especificadas.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Resposta de pesquisa criada com sucesso.',
      type: SurveyResponseWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma resposta de pesquisa com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateSurveyResponseDto) {
    return this.surveyResponsesService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar respostas de pesquisa',
    description: 'Retorna uma lista de todas as respostas de pesquisa.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de respostas de pesquisa encontrada.',
      type: SurveyResponseWithRelationsResponseDto,
      isArray: true
    }
  })
  async list(@Query() queryParams: { surveyId?: string; userId?: string }) {
    return this.surveyResponsesService.list(queryParams);
  }

  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar resposta de pesquisa por ID',
    description: 'Retorna uma resposta de pesquisa específica pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Resposta de pesquisa encontrada.',
      type: SurveyResponseWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Resposta de pesquisa não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyResponsesService.show(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar resposta de pesquisa',
    description: 'Remove permanentemente uma resposta de pesquisa pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Resposta de pesquisa deletada com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Resposta de pesquisa não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.surveyResponsesService.delete(id);
  }
}
