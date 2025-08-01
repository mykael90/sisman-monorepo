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
import { InfrastructureFacilitiesComplexesService } from './infrastructure-facilities-complexes.service';
import {
  CreateInfrastructureFacilityComplexDto,
  InfrastructureFacilityComplexWithRelationsResponseDto,
  UpdateInfrastructureFacilityComplexDto
} from '@sisman/types';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
@ApiTags('Infrastructure Facilities Complexes') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('infrastructure-facilities-complexes')
export class InfrastructureFacilitiesComplexesController {
  constructor(
    private readonly infrastructureFacilitiesComplexesService: InfrastructureFacilitiesComplexesService
  ) {}

  /**
   * Cria um novo complexo de instalações de infraestrutura.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo complexo de instalações de infraestrutura',
    description: 'Cria um novo complexo de instalações de infraestrutura.',
    response: {
      status: HttpStatus.CREATED,
      description:
        'Complexo de instalações de infraestrutura criado com sucesso.',
      type: InfrastructureFacilityComplexWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um complexo de instalações de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateInfrastructureFacilityComplexDto) {
    return this.infrastructureFacilitiesComplexesService.create(data);
  }

  /**
   * Busca um complexo de instalações de infraestrutura específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Complexo de Instalações de Infraestrutura por ID',
    description:
      'Retorna um complexo de instalações de infraestrutura específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Complexo de instalações de infraestrutura encontrado.',
      type: InfrastructureFacilityComplexWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Complexo de instalações de infraestrutura não encontrado.'
      }
    ]
  })
  async show(@Param('id') id: string) {
    return this.infrastructureFacilitiesComplexesService.show(id);
  }

  /**
   * Lista todos os complexos de instalações de infraestrutura.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar complexos de instalações de infraestrutura',
    description:
      'Retorna uma lista de todos os complexos de instalações de infraestrutura.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de complexos de instalações de infraestrutura.',
      type: InfrastructureFacilityComplexWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.infrastructureFacilitiesComplexesService.list();
  }

  /**
   * Atualiza um complexo de instalações de infraestrutura existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Complexo de Instalações de Infraestrutura',
    description:
      'Atualiza os dados de um complexo de instalações de infraestrutura existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description:
        'Complexo de instalações de infraestrutura atualizado com sucesso.',
      type: InfrastructureFacilityComplexWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Complexo de instalações de infraestrutura não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um complexo de instalações de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async update(
    @Param('id') id: string,

    @Body() data: UpdateInfrastructureFacilityComplexDto
  ) {
    return this.infrastructureFacilitiesComplexesService.update(id, data);
  }

  /**
   * Deleta um complexo de instalações de infraestrutura.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Complexo de Instalações de Infraestrutura',
    description:
      'Remove permanentemente um complexo de instalações de infraestrutura pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description:
        'Complexo de instalações de infraestrutura deletado com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Complexo de instalações de infraestrutura não encontrado.'
      }
    ]
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.infrastructureFacilitiesComplexesService.delete(id);
  }
}
