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
import { MaterialWithdrawalsService } from './material-withdrawals.service';
import {
  CreateMaterialWithdrawalWithRelationsDto,
  MaterialWithdrawalWithRelationsResponseDto,
  UpdateMaterialWithdrawalWithRelationsDto
} from './dto/material-withdrawal.dto';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';

@ApiTags('Material Withdrawals') // Agrupa os endpoints na UI do Swagger
@UseGuards(AuthGuard)
@Controller('material-withdrawal')
export class MaterialWithdrawalsController {
  constructor(
    private readonly materialWithdrawalsService: MaterialWithdrawalsService
  ) {}

  /**
   * Cria uma nova retirada de material.
   */
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
}
