import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  HttpStatus,
  Post,
  Put,
  UseGuards,
  Logger,
  Query
} from '@nestjs/common';
import { MaterialRequestsService } from './material-requests.service';

import {
  CreateMaterialRequestWithRelationsDto,
  MaterialRequestWithRelationsResponseDto,
  UpdateMaterialRequestWithRelationsDto
} from './dto/material-request.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Material Request') // Agrupa os endpoints na UI do Swagger
@Roles(Role.Adm) // Assumindo que apenas Adm pode gerenciar, ajuste conforme necessário
@UseGuards(AuthGuard, RoleGuard)
@Controller('material-request')
export class MaterialRequestsController {
  private readonly logger = new Logger(MaterialRequestsController.name);

  constructor(
    private readonly materialRequestsService: MaterialRequestsService
  ) {}

  /**
   * Cria uma nova requisição de material, incluindo seus itens e status inicial.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar Requisição de Material',
    description:
      'Cria uma nova requisição de material com seus itens e status.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Requisição de material criada com sucesso.',
      type: MaterialRequestWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos.'
      }
    ]
  })
  async create(
    @Body() createDto: CreateMaterialRequestWithRelationsDto
  ): Promise<MaterialRequestWithRelationsResponseDto> {
    return this.materialRequestsService.create(createDto);
  }

  /**
   * Lista todas as requisições de material.
   */
  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar Requisições de Material',
    description: 'Retorna uma lista de todas as requisições de material.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de requisições recuperada com sucesso.',
      type: MaterialRequestWithRelationsResponseDto, // Usa a DTO de resposta
      isArray: true // Indica que a resposta é um array
    }
  })
  async list(): Promise<MaterialRequestWithRelationsResponseDto[]> {
    return this.materialRequestsService.list();
  }

  @Get('/protocol')
  async showByProtocolNumber(@Query('value') value: string) {
    return this.materialRequestsService.findByProtocolNumber(value);
  }

  /**
   * Busca uma requisição de material específica pelo seu ID.
   */
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar Requisição por ID',
    description:
      'Retorna uma requisição de material específica, incluindo suas relações.',
    response: {
      status: HttpStatus.OK,
      description: 'Requisição de material encontrada.',
      type: MaterialRequestWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Requisição de material não encontrada.'
      }
    ]
  })
  async show(
    @Param('id') id: number
  ): Promise<MaterialRequestWithRelationsResponseDto> {
    return this.materialRequestsService.show(id);
  }

  //TODO: tem que criar o metodo ainda do balanco por protocolo.
  @Get('/balance/protocol')
  async showBalanceByProtocolNumber(@Query('value') value: string) {
    return this.materialRequestsService.showBalanceByProtocolNumber(value);
  }

  /**
   * Busca uma requisição de material específica pelo seu ID e apresenta o saldo livre baseado no consumo, restrições e reservas.
   */
  @Get('balance/:id')
  @ApiEndpointSwagger({
    summary: 'Buscar Requisição por ID',
    description:
      'Retorna uma requisição de material específica, incluindo suas relações.',
    response: {
      status: HttpStatus.OK,
      description: 'Requisição de material encontrada.',
      type: MaterialRequestWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Requisição de material não encontrada.'
      }
    ]
  })
  async showBalance(
    @Param('id') id: number
  ): Promise<MaterialRequestWithRelationsResponseDto> {
    return this.materialRequestsService.showBalance(id);
  }

  /**
   * Atualiza uma requisição de material existente.
   */
  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar Requisição de Material',
    description:
      'Atualiza os dados de uma requisição de material existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Requisição de material atualizada com sucesso.',
      type: MaterialRequestWithRelationsResponseDto // Usa a DTO de resposta
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Requisição de material não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos.'
      }
    ]
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateMaterialRequestWithRelationsDto
  ): Promise<MaterialRequestWithRelationsResponseDto> {
    return this.materialRequestsService.update(id, updateDto);
  }

  /**
   * Deleta uma requisição de material.
   */
  @Delete(':id')
  @ApiEndpointSwagger({
    summary: 'Deletar Requisição de Material',
    description:
      'Remove permanentemente uma requisição de material pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT, // 204 é o status correto para delete sem retorno
      description: 'Requisição de material deletada com sucesso.'
      // Não há 'type' para respostas 204
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Requisição de material não encontrada.'
      }
    ]
  })
  // O tipo de retorno para uma operação de delete bem-sucedida é 'void'
  async delete(@Param('id') id: number): Promise<void> {
    const deleted = await this.materialRequestsService.delete(id);
    this.logger.log(`Registro deletado`);
    this.logger.log(deleted);
    return;
  }
}
