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
import { InfrastructureSpaceTypesService } from './infrastructure-space-types.service';
import {
  CreateInfrastructureSpaceTypeDto,
  InfrastructureSpaceTypeWithRelationsResponseDto,
  UpdateInfrastructureSpaceTypeDto
} from '@sisman/types';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
@ApiTags('Infrastructure Space Types') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('infrastructure-space-types')
export class InfrastructureSpaceTypesController {
  constructor(
    private readonly infrastructureSpaceTypesService: InfrastructureSpaceTypesService
  ) {}

  /**
   * Cria um novo tipo de espaço de infraestrutura.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo tipo de espaço de infraestrutura',
    description: 'Cria um novo tipo de espaço de infraestrutura.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Tipo de espaço de infraestrutura criado com sucesso.',
      type: InfrastructureSpaceTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de espaço de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateInfrastructureSpaceTypeDto) {
    return this.infrastructureSpaceTypesService.create(data);
  }

  /**
   * Busca um tipo de espaço de infraestrutura específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Tipo de Espaço de Infraestrutura por ID',
    description: 'Retorna um tipo de espaço de infraestrutura específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Tipo de espaço de infraestrutura encontrado.',
      type: InfrastructureSpaceTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de espaço de infraestrutura não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.infrastructureSpaceTypesService.show(id);
  }

  /**
   * Lista todos os tipos de espaços de infraestrutura.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar tipos de espaços de infraestrutura',
    description:
      'Retorna uma lista de todos os tipos de espaços de infraestrutura.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de tipos de espaços de infraestrutura.',
      type: InfrastructureSpaceTypeWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.infrastructureSpaceTypesService.list();
  }

  /**
   * Atualiza um tipo de espaço de infraestrutura existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Tipo de Espaço de Infraestrutura',
    description:
      'Atualiza os dados de um tipo de espaço de infraestrutura existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Tipo de espaço de infraestrutura atualizado com sucesso.',
      type: InfrastructureSpaceTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de espaço de infraestrutura não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de espaço de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,

    @Body() data: UpdateInfrastructureSpaceTypeDto
  ) {
    return this.infrastructureSpaceTypesService.update(id, data);
  }

  /**
   * Deleta um tipo de espaço de infraestrutura.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Tipo de Espaço de Infraestrutura',
    description:
      'Remove permanentemente um tipo de espaço de infraestrutura pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Tipo de espaço de infraestrutura deletado com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de espaço de infraestrutura não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.infrastructureSpaceTypesService.delete(id);
  }
}
