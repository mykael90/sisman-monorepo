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
import { MaterialWarehouseStocksService } from './material-warehouse-stocks.service';
import {
  CreateMaterialWarehouseStockDto,
  MaterialWarehouseStockWithRelationsResponseDto,
  UpdateMaterialWarehouseStockDto
} from './dto/material-warehouse-stock.dto';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';

@ApiTags('MaterialWarehouseStocks') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard) // Assuming RoleGuard is not needed for now, based on the original request
@Controller('material-warehouse-stock')
export class MaterialWarehouseStocksController {
  constructor(
    private readonly materialWarehouseStocksService: MaterialWarehouseStocksService
  ) {}

  /**
   * Cria um novo registro de estoque de material em almoxarifado.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo registro de estoque de material em almoxarifado',
    description:
      'Cria um novo registro de estoque de material em almoxarifado.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Registro de estoque criado com sucesso.',
      type: MaterialWarehouseStockWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um registro de estoque com os dados fornecidos (ex: materialId e warehouseId já em uso).'
      }
    ]
  })
  async create(@Body() data: CreateMaterialWarehouseStockDto) {
    return this.materialWarehouseStocksService.create(data);
  }

  /**
   * Busca um registro de estoque específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Registro de Estoque por ID',
    description: 'Retorna um registro de estoque específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Registro de estoque encontrado.',
      type: MaterialWarehouseStockWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Registro de estoque não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.materialWarehouseStocksService.show(id);
  }

  /**
   * Lista todos os registros de estoque de material em almoxarifado.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar registros de estoque de materiais em almoxarifados',
    description:
      'Retorna uma lista de todos os registros de estoque de materiais em almoxarifados.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de registros de estoque.',
      type: MaterialWarehouseStockWithRelationsResponseDto,
      isArray: true
    }
  })
  async list() {
    return this.materialWarehouseStocksService.list();
  }

  /**
   * Atualiza um registro de estoque de material em almoxarifado existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Registro de Estoque',
    description:
      'Atualiza os dados de um registro de estoque existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Registro de estoque atualizado com sucesso.',
      type: MaterialWarehouseStockWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Registro de estoque não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um registro de estoque com os dados fornecidos (ex: materialId e warehouseId já em uso).'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMaterialWarehouseStockDto
  ) {
    return this.materialWarehouseStocksService.update(id, data);
  }

  /**
   * Deleta um registro de estoque de material em almoxarifado.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar Registro de Estoque',
    description: 'Remove permanentemente um registro de estoque pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Registro de estoque deletado com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Registro de estoque não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialWarehouseStocksService.delete(id);
  }
}
