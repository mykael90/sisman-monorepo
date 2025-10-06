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
import { MaterialWithdrawalsService } from './material-withdrawals.service';
import {
  CreateMaterialWithdrawalWithRelationsDto,
  MaterialWithdrawalWithRelationsResponseDto,
  UpdateMaterialWithdrawalWithRelationsDto
} from './dto/material-withdrawal.dto';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { MaterialStockOperationSubType } from '@sisman/prisma';
import { RoleGuard } from '../../shared/auth/guards/role.guard';

@ApiTags('Material Withdrawals') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard, RoleGuard)
@Controller('material-withdrawal')
export class MaterialWithdrawalsController {
  private readonly logger = new Logger(MaterialWithdrawalsController.name);
  constructor(
    private readonly materialWithdrawalsService: MaterialWithdrawalsService
  ) {}

  /**
   * Cria uma nova retirada de material.
   */
  @Roles(Role.Adm, Role.AdmMaterials, Role.SuperMaterials)
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova retirada de material',
    description: 'Cria uma nova retirada de material.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Retirada de material criada com sucesso.',
      type: MaterialWithdrawalWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma retirada de material com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateMaterialWithdrawalWithRelationsDto) {
    return this.materialWithdrawalsService.create(data);
  }

  /**
   * Lista todas as retiradas de material por depósito.
   */
  @Get('warehouse/:warehouseId')
  @ApiEndpointSwagger({
    summary: 'Listar retiradas de material por depósito',
    description: 'Retorna uma lista de todas as retiradas de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de retiradas de material.',
      type: MaterialWithdrawalWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async listByWarehouse(
    @Query()
    queryParams: {
      [key: string]: string;
      movementSubTypeCode?: MaterialStockOperationSubType;
    },
    @Param('warehouseId', ParseIntPipe) warehouseId: number
  ) {
    console.log(warehouseId);
    return this.materialWithdrawalsService.listByWarehouse(
      warehouseId,
      queryParams
    );
  }

  /**
   * Busca uma retirada de material específica pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Retirada de Material por ID',
    description: 'Retorna uma retirada de material específica.',
    response: {
      status: HttpStatus.OK,
      description: 'Retirada de material encontrada.',
      type: MaterialWithdrawalWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Retirada de material não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.materialWithdrawalsService.show(id);
  }

  /**
   * Lista todas as retiradas de material.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar retiradas de material',
    description: 'Retorna uma lista de todas as retiradas de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de retiradas de material.',
      type: MaterialWithdrawalWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list() {
    return this.materialWithdrawalsService.list();
  }

  /**
   * Atualiza uma retirada de material existente.
   */
  @Roles(Role.Adm, Role.AdmMaterials, Role.SuperMaterials)
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Retirada de Material',
    description:
      'Atualiza os dados de uma retirada de material existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Retirada de material atualizada com sucesso.',
      type: MaterialWithdrawalWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Retirada de material não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma retirada de material com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMaterialWithdrawalWithRelationsDto
  ) {
    return this.materialWithdrawalsService.update(id, data);
  }

  /**
   * Deleta uma retirada de material.
   */
  @Roles(Role.Adm, Role.AdmMaterials, Role.SuperMaterials)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Garante que a resposta seja 204 No Content.
  @ApiEndpointSwagger({
    summary: 'Deletar Retirada de Material',
    description: 'Remove permanentemente uma retirada de material pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Retirada de material deletada com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Retirada de material não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.materialWithdrawalsService.delete(id);
  }

  @Post('/adm/verify-withdrawals-integrity')
  @UseGuards(AuthGuard)
  // @Roles(Role.Adm)
  @ApiEndpointSwagger({
    summary:
      'Verifica e corrige a integridade dos movimentos de estoque de retiradas.',
    description:
      'Endpoint para administradores e desenvolvedores para forçar a verificação e correção da integridade dos dados de retiradas de materiais, garantindo que os movimentos de estoque reflitam com precisão as retiradas registradas.',
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
  async verifyWithdrawalsIntegrity() {
    this.logger.log(
      'Requisição recebida para verificar integridade das retiradas.'
    );
    try {
      const result =
        await this.materialWithdrawalsService.verifyIntregrityOfWithdrawals();
      return {
        message: 'Verificação de integridade das retiradas concluída.',
        details: result
      };
    } catch (error) {
      this.logger.error(
        'Erro ao verificar integridade das retiradas:',
        error.stack
      );
      // Lança o erro para ser tratado pelo Exception Filter global do NestJS
      throw error;
    }
  }
}
