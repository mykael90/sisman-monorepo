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
import { MaterialRestrictionOrdersService } from './material-restriction-orders.service';
import {
  CreateMaterialRestrictionOrderWithRelationsDto,
  MaterialRestrictionOrderWithRelationsResponseDto,
  UpdateMaterialRestrictionOrderWithRelationsDto
} from '@sisman/types';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';

@ApiTags('Material Restriction Orders') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('material-restriction-order')
export class MaterialRestrictionOrdersController {
  constructor(
    private readonly materialRestrictionOrdersService: MaterialRestrictionOrdersService
  ) {}

  /**
   * Cria uma nova ordem de restrição de material.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova ordem de restrição de material',
    description: 'Cria uma nova ordem de restrição de material.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Ordem de restrição de material criada com sucesso.',
      type: MaterialRestrictionOrderWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma ordem de restrição de material com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateMaterialRestrictionOrderWithRelationsDto) {
    return this.materialRestrictionOrdersService.create(data);
  }

  /**
   * Busca uma ordem de restrição de material específica pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Ordem de Restrição de Material por ID',
    description: 'Retorna uma ordem de restrição de material específica.',
    response: {
      status: HttpStatus.OK,
      description: 'Ordem de restrição de material encontrada.',
      type: MaterialRestrictionOrderWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Ordem de restrição de material não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.materialRestrictionOrdersService.show(id);
  }

  /**
   * Lista todas as ordens de restrição de material.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar ordens de restrição de material',
    description:
      'Retorna uma lista de todas as ordens de restrição de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de ordens de restrição de material.',
      type: MaterialRestrictionOrderWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.materialRestrictionOrdersService.list();
  }

  /**
   * Atualiza uma ordem de restrição de material existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Ordem de Restrição de Material',
    description:
      'Atualiza os dados de uma ordem de restrição de material existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Ordem de restrição de material atualizada com sucesso.',
      type: MaterialRestrictionOrderWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Ordem de restrição de material não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma ordem de restrição de material com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMaterialRestrictionOrderWithRelationsDto
  ) {
    return this.materialRestrictionOrdersService.update(id, data);
  }

  /**
   * Deleta uma ordem de restrição de material.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Ordem de Restrição de Material',
    description:
      'Remove permanentemente uma ordem de restrição de material pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Ordem de restrição de material deletada com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Ordem de restrição de material não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialRestrictionOrdersService.delete(id);
  }
}
