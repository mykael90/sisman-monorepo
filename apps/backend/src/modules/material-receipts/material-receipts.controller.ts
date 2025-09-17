import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { MaterialReceiptsService } from './material-receipts.service';
import {
  CreateMaterialReceiptWithRelationsDto,
  MaterialReceiptWithRelationsResponseDto,
  UpdateMaterialReceiptWithRelationsDto
} from './dto/material-receipt.dto';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
@ApiTags('Material Receipts') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('material-receipt')
export class MaterialReceiptsController {
  private readonly logger = new Logger(MaterialReceiptsController.name);

  constructor(
    private readonly materialReceiptsService: MaterialReceiptsService
  ) {}

  /**
   * Cria um novo recebimento de material.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo recebimento de material',
    description: 'Cria um novo recebimento de material.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Recebimento de material criado com sucesso.',
      type: MaterialReceiptWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um recebimento de material com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateMaterialReceiptWithRelationsDto) {
    return this.materialReceiptsService.create(data);
  }

  /**
   * Lista todas as entradas de material por depósito.
   */
  @Get('warehouse/:warehouseId')
  @ApiEndpointSwagger({
    summary: 'Listar entradas de material por depósito',
    description: 'Retorna uma lista de todas as entradas de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de entradas de material.',
      type: MaterialReceiptWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async listByWarehouse(
    @Query() queryParams: { [key: string]: string },
    @Param('warehouseId', ParseIntPipe) warehouseId: number
  ) {
    console.log(warehouseId);
    return this.materialReceiptsService.listByWarehouse(
      warehouseId,
      queryParams
    );
  }

  /**
   * Busca um recebimento de material específico pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Recebimento de Material por ID',
    description: 'Retorna um recebimento de material específico.',
    response: {
      status: HttpStatus.OK,
      description: 'Recebimento de material encontrado.',
      type: MaterialReceiptWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Recebimento de material não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.materialReceiptsService.show(id);
  }

  /**
   * Lista todos os recebimentos de material.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar recebimentos de material',
    description: 'Retorna uma lista de todos os recebimentos de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de recebimentos de material.',
      type: MaterialReceiptWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.materialReceiptsService.list();
  }

  /**
   * Atualiza um recebimento de material existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Recebimento de Material',
    description:
      'Atualiza os dados de um recebimento de material existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Recebimento de material atualizado com sucesso.',
      type: MaterialReceiptWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Recebimento de material não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um recebimento de material com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMaterialReceiptWithRelationsDto
  ) {
    return this.materialReceiptsService.update(id, data);
  }

  /**
   * Deleta um recebimento de material.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Recebimento de Material',
    description:
      'Remove permanentemente um recebimento de material pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Recebimento de material deletado com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Recebimento de material não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialReceiptsService.delete(id);
  }

  @Post('/adm/verify-receipts-integrity')
  @UseGuards(AuthGuard)
  @Roles(Role.Adm)
  @ApiEndpointSwagger({
    summary:
      'Verifica e corrige a integridade dos movimentos de estoque de entradas.',
    description:
      'Endpoint para administradores e desenvolvedores para forçar a verificação e correção da integridade dos dados de entradas de materiais, garantindo que os movimentos de estoque reflitam com precisão as entradas registradas.',
    response: {
      status: HttpStatus.OK,
      description: 'Relatório da verificação de integridade.'
      // O tipo de retorno é um objeto com `message` e `details`,
      // que pode ser melhor documentado com um DTO específico se necessário.
    },
    errors: [
      { status: HttpStatus.UNAUTHORIZED, description: 'Não autorizado.' },
      {
        status: HttpStatus.FORBIDDEN,
        description: 'Proibido (permissão insuficiente).'
      },
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Erro interno do servidor durante a verificação.'
      }
    ]
  })
  async verifyReceiptsIntegrity() {
    this.logger.log(
      'Requisição recebida para verificar integridade das entradas de materiais.'
    );
    try {
      const result =
        await this.materialReceiptsService.verifyIntregrityOfReceipts();
      return {
        message: 'Verificação de integridade das entradas concluída.',
        details: result
      };
    } catch (error) {
      this.logger.error(
        'Erro ao verificar integridade das entradas:',
        error.stack
      );
      // Lança o erro para ser tratado pelo Exception Filter global do NestJS
      throw error;
    }
  }
}
