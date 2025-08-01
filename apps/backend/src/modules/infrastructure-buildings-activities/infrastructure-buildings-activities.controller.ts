import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { InfrastructureBuildingsActivitiesService } from './infrastructure-buildings-activities.service';
import {
  CreateInfrastructureBuildingActivityDto,
  InfrastructureBuildingActivityResponseDto,
  UpdateInfrastructureBuildingActivityDto
} from '@sisman/types';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
@ApiTags('InfrastructureBuildingsActivities') // Agrupa os endpoints na UI do Swagger
@Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('infrastructure-building-activity')
export class InfrastructureBuildingsActivitiesController {
  constructor(
    private readonly infrastructureBuildingsActivitiesService: InfrastructureBuildingsActivitiesService
  ) {}

  /**
   * Cria uma nova atividade de construção de infraestrutura.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova atividade de construção de infraestrutura',
    description: 'Cria uma nova atividade de construção de infraestrutura.',
    response: {
      status: HttpStatus.CREATED,
      description:
        'Atividade de construção de infraestrutura criada com sucesso.',
      type: InfrastructureBuildingActivityResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma atividade com os dados fornecidos (ex: id ou nome da atividade já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateInfrastructureBuildingActivityDto) {
    return this.infrastructureBuildingsActivitiesService.create(data);
  }

  /**
   * Busca uma atividade específica pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Atividade por ID',
    description: 'Retorna uma atividade específica.',
    response: {
      status: HttpStatus.OK,
      description: 'Atividade de construção de infraestrutura encontrada.',
      type: InfrastructureBuildingActivityResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Atividade de construção de infraestrutura não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.infrastructureBuildingsActivitiesService.show(id);
  }

  /**
   * Lista todas as atividades de construção de infraestrutura.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar atividades de construção de infraestrutura',
    description:
      'Retorna uma lista de todos as atividades de construção de infraestrutura.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de atividades de construção de infraestrutura.',
      type: InfrastructureBuildingActivityResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.infrastructureBuildingsActivitiesService.list();
  }

  /**
   * Atualiza uma atividade de construção de infraestrutura existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Atividade',
    description: 'Atualiza os dados de uma atividade existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description:
        'Atividade de construção de infraestrutura atualizada com sucesso.',
      type: InfrastructureBuildingActivityResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Atividade de construção de infraestrutura não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma atividade com os dados fornecidos (ex: id ou nome da atividade já em uso).'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateInfrastructureBuildingActivityDto
  ) {
    return this.infrastructureBuildingsActivitiesService.update(id, data);
  }

  /**
   * Deleta uma atividade de construção de infraestrutura.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Atividade de Construção de Infraestrutura',
    description:
      'Remove permanentemente uma atividade de construção de infraestrutura pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description:
        'Atividade de construção de infraestrutura deletada com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Atividade de construção de infraestrutura não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.infrastructureBuildingsActivitiesService.delete(id);
  }
}
