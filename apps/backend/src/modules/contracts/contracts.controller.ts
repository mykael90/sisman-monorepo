import { FindManyContractsDto } from './dto/find-many-contracts.dto';
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
  Query
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  CreateContractDto,
  UpdateContractDto,
  ContractWithRelationsResponseDto,
  CreateContractWithRelationsDto
} from './dto/contract.dto';

@Controller('contracts')
@ApiTags('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * Cria um novo contrato.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo contrato',
    description: 'Cria um novo contrato com os dados fornecidos.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Contrato criado com sucesso.',
      type: ContractWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      }
    ]
  })
  async create(@Body() data: CreateContractWithRelationsDto) {
    return this.contractsService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar contratos',
    description: 'Retorna uma lista de todos os contratos.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de contratos encontrada.',
      type: ContractWithRelationsResponseDto,
      isArray: true
    }
  })
  async findMany() {
    return this.contractsService.list();
  }

  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar contrato por ID',
    description: 'Retorna um contrato específico pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Contrato encontrado.',
      type: ContractWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Contrato não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.show(id);
  }

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar contrato',
    description: 'Atualiza os dados de um contrato existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Contrato atualizado com sucesso.',
      type: ContractWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Contrato não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateContractDto
  ) {
    return this.contractsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar contrato',
    description: 'Remove permanentemente um contrato pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Contrato deletado com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Contrato não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.contractsService.delete(id);
  }
}
