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
  Query,
  UseGuards
} from '@nestjs/common';
import { MaterialPickingOrdersService } from './material-picking-orders.service';
import {
  CreateMaterialPickingOrderWithRelationsDto,
  MaterialPickingOrderWithRelationsResponseDto,
  UpdateMaterialPickingOrderWithRelationsDto
} from './dto/material-picking-order.dto';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import { MaterialPickingOrderStatus } from '@sisman/prisma';

@ApiTags('Material Picking Orders') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('material-picking-order')
export class MaterialPickingOrdersController {
  constructor(
    private readonly materialPickingOrdersService: MaterialPickingOrdersService
  ) {}

  /**
   * Cria uma nova ordem de separação de material.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova ordem de separação de material',
    description: 'Cria uma nova ordem de separação de material.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Ordem de separação de material criada com sucesso.',
      type: MaterialPickingOrderWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma ordem de separação de material com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateMaterialPickingOrderWithRelationsDto) {
    return this.materialPickingOrdersService.create(data);
  }

  /**
   * Busca uma ordem de separação de material específica pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Ordem de Separação de Material por ID',
    description: 'Retorna uma ordem de separação de material específica.',
    response: {
      status: HttpStatus.OK,
      description: 'Ordem de separação de material encontrada.',
      type: MaterialPickingOrderWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Ordem de separação de material não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.materialPickingOrdersService.show(id);
  }

  /**
   * Lista todas as ordens de separação de material.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar ordens de separação de material',
    description:
      'Retorna uma lista de todas as ordens de separação de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de ordens de separação de material.',
      type: MaterialPickingOrderWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.materialPickingOrdersService.list();
  }

  /**
   * Lista todas as ordens de separação de material por depósito.
   */
  @Get('warehouse/:warehouseId')
  @ApiEndpointSwagger({
    summary: 'Listar ordens de separação de material por depósito',
    description:
      'Retorna uma lista de todas as ordens de separação de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de ordens de separação de material.',
      type: MaterialPickingOrderWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async listByWarehouse(
    @Query()
    queryParams: {
      [key: string]: string;
    },
    @Param('warehouseId', ParseIntPipe) warehouseId: number
  ) {
    return this.materialPickingOrdersService.listByWarehouse(
      warehouseId,
      queryParams
    );
  }

  /**
   * Atualiza uma ordem de separação de material existente.
   */
  @Put('operation-by-status/:id')
  @ApiEndpointSwagger({
    summary:
      'Atualizar Ordem de Separação de Material fornecendo apenas o status',
    description:
      'Atualiza os dados de uma ordem de separação de material existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Ordem de separação de material atualizada com sucesso.',
      type: MaterialPickingOrderWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Ordem de separação de material não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma ordem de separação de material com os dados fornecidos.'
      }
    ]
  })
  async updateOperationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { userId: number; status: MaterialPickingOrderStatus }
  ) {
    return this.materialPickingOrdersService.operationInPickingOrder(
      id,
      data.userId,
      data.status
    );
  }

  /**
   * Atualiza uma ordem de separação de material existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Ordem de Separação de Material',
    description:
      'Atualiza os dados de uma ordem de separação de material existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Ordem de separação de material atualizada com sucesso.',
      type: MaterialPickingOrderWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Ordem de separação de material não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma ordem de separação de material com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMaterialPickingOrderWithRelationsDto
  ) {
    return this.materialPickingOrdersService.update(id, data);
  }

  /**
   * Deleta uma ordem de separação de material.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Ordem de Separação de Material',
    description:
      'Remove permanentemente uma ordem de separação de material pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Ordem de separação de material deletada com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Ordem de separação de material não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialPickingOrdersService.delete(id);
  }
}
