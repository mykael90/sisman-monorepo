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
  UseGuards
} from '@nestjs/common';
import { InfrastructureBuildingsService } from './infrastructure-buildings.service';
import {
  CreateInfrastructureBuildingDto,
  InfrastructureBuildingWithRelationsResponseDto,
  UpdateInfrastructureBuildingDto
} from '@sisman/types';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
@ApiTags('Infrastructure Buildings') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('infrastructure-building')
export class InfrastructureBuildingsController {
  constructor(
    private readonly infrastructureBuildingsService: InfrastructureBuildingsService
  ) {}

  /**
   * Cria um novo edifício de infraestrutura.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo edifício de infraestrutura',
    description: 'Cria um novo edifício de infraestrutura.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Edifício de infraestrutura criado com sucesso.',
      type: InfrastructureBuildingWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um edifício de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateInfrastructureBuildingDto) {
    return this.infrastructureBuildingsService.create(data);
  }

  /**
   * Busca um edifício de infraestrutura específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Edifício de Infraestrutura por ID',
    description: 'Retorna um edifício de infraestrutura específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Edifício de infraestrutura encontrado.',
      type: InfrastructureBuildingWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Edifício de infraestrutura não encontrado.'
      }
    ]
  })
  async show(@Param('id') id: string) {
    return this.infrastructureBuildingsService.show(id);
  }

  /**
   * Lista todos os edifícios de infraestrutura.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar edifícios de infraestrutura',
    description: 'Retorna uma lista de todos os edifícios de infraestrutura.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de edifícios de infraestrutura.',
      type: InfrastructureBuildingWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.infrastructureBuildingsService.list();
  }

  /**
   * Atualiza um edifício de infraestrutura existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Edifício de Infraestrutura',
    description:
      'Atualiza os dados de um edifício de infraestrutura existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Edifício de infraestrutura atualizado com sucesso.',
      type: InfrastructureBuildingWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Edifício de infraestrutura não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um edifício de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async update(
    @Param('id') id: string,

    @Body() data: UpdateInfrastructureBuildingDto
  ) {
    return this.infrastructureBuildingsService.update(id, data);
  }

  /**
   * Deleta um edifício de infraestrutura.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Edifício de Infraestrutura',
    description:
      'Remove permanentemente um edifício de infraestrutura pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Edifício de infraestrutura deletado com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Edifício de infraestrutura não encontrado.'
      }
    ]
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.infrastructureBuildingsService.delete(id);
  }
}
