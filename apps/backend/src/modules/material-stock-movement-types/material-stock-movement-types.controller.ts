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
import { MaterialStockMovementTypesService } from './material-stock-movement-types.service';
import {
  CreateMaterialStockMovementTypeDto,
  MaterialStockMovementTypeWithRelationsResponseDto,
  UpdateMaterialStockMovementTypeDto
} from './dto/material-stock-movement-type.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
@ApiTags('MaterialStockMovementTypes') // Agrupa os endpoints na UI do Swagger
@Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('material-stock-movement-type')
export class MaterialStockMovementTypesController {
  constructor(
    private readonly materialStockMovementTypesService: MaterialStockMovementTypesService
  ) {}

  /**
   * Cria um novo tipo de movimentação de estoque.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo tipo de movimentação de estoque',
    description: 'Cria um novo tipo de movimentação de estoque.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Tipo de movimentação de estoque criado com sucesso.',
      type: MaterialStockMovementTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de movimentação de estoque com os dados fornecidos (ex: id ou nome do tipo de movimentação de estoque já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateMaterialStockMovementTypeDto) {
    return this.materialStockMovementTypesService.create(data);
  }

  /**
   * Busca um tipo de movimentação de estoque específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Tipo de Movimentação de Estoque por ID',
    description: 'Retorna um tipo de movimentação de estoque específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Tipo de movimentação de estoque encontrado.',
      type: MaterialStockMovementTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de movimentação de estoque não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.materialStockMovementTypesService.show(id);
  }

  /**
   * Lista todos os tipos de movimentação de estoque.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar tipos de movimentação de estoque',
    description:
      'Retorna uma lista de todos os tipos de movimentação de estoque.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de tipos de movimentação de estoque.',
      type: MaterialStockMovementTypeWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.materialStockMovementTypesService.list();
  }

  /**
   * Atualiza um tipo de movimentação de estoque existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Tipo de Movimentação de Estoque',
    description:
      'Atualiza os dados de um tipo de movimentação de estoque existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Tipo de movimentação de estoque atualizado com sucesso.',
      type: MaterialStockMovementTypeWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de movimentação de estoque não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de movimentação de estoque com os dados fornecidos (ex: id ou nome do tipo de movimentação de estoque já em uso).'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,

    @Body() data: UpdateMaterialStockMovementTypeDto
  ) {
    return this.materialStockMovementTypesService.update(id, data);
  }

  /**
   * Deleta um tipo de movimentação de estoque.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Tipo de Movimentação de Estoque',
    description:
      'Remove permanentemente um tipo de movimentação de estoque pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Tipo de movimentação de estoque deletado com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de movimentação de estoque não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialStockMovementTypesService.delete(id);
  }
}
