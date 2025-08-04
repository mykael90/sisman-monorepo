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
import { InfrastructureBuildingTypesService } from './infrastructure-buildings-types.service';
import {
  CreateInfrastructureBuildingTypeDto,
  InfrastructureBuildingTypeWithRelationsResponseDto,
  UpdateInfrastructureBuildingTypeDto
} from '@sisman/types/backend';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';

@ApiTags('Infrastructure Building Types') // Agrupa os endpoints na UI do Swagger
@Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('infrastructure-building-types')
export class InfrastructureBuildingTypesController {
  constructor(
    private readonly infrastructureBuildingTypesService: InfrastructureBuildingTypesService
  ) {}

  /**
   * Cria um novo tipo de edificação de infraestrutura.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo tipo de edificação de infraestrutura',
    description: 'Cria um novo tipo de edificação de infraestrutura.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Tipo de edificação de infraestrutura criado com sucesso.',
      type: InfrastructureBuildingTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de edificação de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateInfrastructureBuildingTypeDto) {
    return this.infrastructureBuildingTypesService.create(data);
  }

  /**
   * Busca um tipo de edificação de infraestrutura específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Tipo de Edificação de Infraestrutura por ID',
    description: 'Retorna um tipo de edificação de infraestrutura específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Tipo de edificação de infraestrutura encontrado.',
      type: InfrastructureBuildingTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de edificação de infraestrutura não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.infrastructureBuildingTypesService.show(id);
  }

  /**
   * Lista todos os tipos de edificação de infraestrutura.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar tipos de edificação de infraestrutura',
    description:
      'Retorna uma lista de todos os tipos de edificação de infraestrutura.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de tipos de edificação de infraestrutura.',
      type: InfrastructureBuildingTypeWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.infrastructureBuildingTypesService.list();
  }

  /**
   * Atualiza um tipo de edificação de infraestrutura existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Tipo de Edificação de Infraestrutura',
    description:
      'Atualiza os dados de um tipo de edificação de infraestrutura existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description:
        'Tipo de edificação de infraestrutura atualizado com sucesso.',
      type: InfrastructureBuildingTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de edificação de infraestrutura não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de edificação de infraestrutura com os dados fornecidos (ex: id ou nome já em uso).'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateInfrastructureBuildingTypeDto
  ) {
    return this.infrastructureBuildingTypesService.update(id, data);
  }

  /**
   * Deleta um tipo de edificação de infraestrutura.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Tipo de Edificação de Infraestrutura',
    description:
      'Remove permanentemente um tipo de edificação de infraestrutura pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Tipo de edificação de infraestrutura deletado com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de edificação de infraestrutura não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.infrastructureBuildingTypesService.delete(id);
  }
}
