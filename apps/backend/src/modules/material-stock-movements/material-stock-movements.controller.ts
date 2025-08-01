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
import { MaterialStockMovementsService } from './material-stock-movements.service';
import {
  CreateMaterialStockMovementWithRelationsDto,
  MaterialStockMovementWithRelationsResponseDto,
  UpdateMaterialStockMovementWithRelationsDto
} from '@sisman/types';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
@ApiTags('Material Stock Movements') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('material-stock-movement')
export class MaterialStockMovementsController {
  constructor(
    private readonly materialStockMovementsService: MaterialStockMovementsService
  ) {}

  /**
   * Cria uma nova movimentação de estoque de material.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova movimentação de estoque de material',
    description: 'Cria uma nova movimentação de estoque de material.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Movimentação de estoque de material criada com sucesso.',
      type: MaterialStockMovementWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma movimentação de estoque de material com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateMaterialStockMovementWithRelationsDto) {
    return this.materialStockMovementsService.create(data);
  }

  /**
   * Busca uma movimentação de estoque de material específica pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Movimentação de Estoque de Material por ID',
    description: 'Retorna uma movimentação de estoque de material específica.',
    response: {
      status: HttpStatus.OK,
      description: 'Movimentação de estoque de material encontrada.',
      type: MaterialStockMovementWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Movimentação de estoque de material não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.materialStockMovementsService.show(id);
  }

  /**
   * Lista todas as movimentações de estoque de material.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar movimentações de estoque de material',
    description:
      'Retorna uma lista de todas as movimentações de estoque de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de movimentações de estoque de material.',
      type: MaterialStockMovementWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.materialStockMovementsService.list();
  }

  /**
   * Atualiza uma movimentação de estoque de material existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Movimentação de Estoque de Material',
    description:
      'Atualiza os dados de uma movimentação de estoque de material existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description:
        'Movimentação de estoque de material atualizada com sucesso.',
      type: MaterialStockMovementWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Movimentação de estoque de material não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma movimentação de estoque de material com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMaterialStockMovementWithRelationsDto
  ) {
    return this.materialStockMovementsService.update(id, data);
  }

  /**
   * Deleta uma movimentação de estoque de material.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Movimentação de Estoque de Material',
    description:
      'Remove permanentemente uma movimentação de estoque de material pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Movimentação de estoque de material deletada com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Movimentação de estoque de material não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialStockMovementsService.delete(id);
  }

  /**
   * Cria uma movimentação de estoque a partir de uma contagem de material.
   */
  @Post('count')
  @ApiEndpointSwagger({
    summary: 'Criar movimentação de estoque a partir da contagem de material',
    description:
      'Cria uma movimentação de ajuste de estoque com base na contagem de um material em um almoxarifado.',
    response: {
      status: HttpStatus.CREATED,
      description:
        'Movimentação de estoque criada a partir da contagem com sucesso.',
      type: MaterialStockMovementWithRelationsResponseDto
    },
    errors: [
      { status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos.' }
    ]
  })
  async creatFromCount(
    @Body()
    data: Omit<CreateMaterialStockMovementWithRelationsDto, 'movementType'>
  ) {
    return this.materialStockMovementsService.countGlobalMaterialInWarehouse(
      data
    );
  }
}
