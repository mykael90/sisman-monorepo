import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';

import { SurveysService } from './surveys.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  CreateSurveyDto,
  UpdateSurveyDto,
  SurveyWithRelationsResponseDto,
  CreateSurveyWithRelationsDto
} from './dto/survey.dto';

// @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('survey')
@ApiTags('survey')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  /**
   * Cria uma nova pesquisa.
   */
  @Roles(Role.Adm)
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova pesquisa',
    description:
      'Cria uma nova pesquisa com as relações especificadas (se houver).',
    response: {
      status: HttpStatus.CREATED,
      description: 'Pesquisa criada com sucesso.',
      type: SurveyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe uma pesquisa com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateSurveyWithRelationsDto) {
    return this.surveysService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar pesquisas',
    description: 'Retorna uma lista de todas as pesquisas.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de pesquisas encontrada.',
      type: SurveyWithRelationsResponseDto,
      isArray: true
    }
  })
  async list(@Query() queryParams: { [key: string]: string }) {
    return this.surveysService.list(queryParams);
  }

  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar pesquisa por ID',
    description: 'Retorna uma pesquisa específica pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Pesquisa encontrada.',
      type: SurveyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Pesquisa não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveysService.show(id);
  }

  @Roles(Role.Adm)
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar pesquisa',
    description: 'Atualiza os dados de uma pesquisa existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Pesquisa atualizada com sucesso.',
      type: SurveyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Pesquisa não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe uma pesquisa com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateSurveyDto
  ) {
    return this.surveysService.update(id, data);
  }

  @Roles(Role.Adm)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar pesquisa',
    description: 'Remove permanentemente uma pesquisa pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Pesquisa deletada com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Pesquisa não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.surveysService.delete(id);
  }
}
