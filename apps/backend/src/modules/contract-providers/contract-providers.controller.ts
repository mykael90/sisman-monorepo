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

import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { RoleGuard } from '../../shared/auth/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import { ContractProvidersService } from './contract-providers.service';
import { FindManyContractProvidersDto } from './dto/find-many-contract-providers.dto';
import {
  CreateContractProviderDto,
  UpdateContractProviderDto
} from './dto/contract-provider.dto';
import { ContractProvider } from '@sisman/prisma';

// @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('contract-providers')
@ApiTags('contract-providers')
export class ContractProvidersController {
  constructor(
    private readonly contractProvidersService: ContractProvidersService
  ) {}

  @Post()
  @ApiEndpointSwagger({
    summary: 'Cria um novo fornecedor de contrato',
    description: 'Cria um novo fornecedor de contrato com os dados fornecidos.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Fornecedor de contrato criado com sucesso.',
      type: CreateContractProviderDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um fornecedor de contrato com os dados fornecidos.'
      }
    ]
  })
  async create(
    @Body() data: CreateContractProviderDto
  ): Promise<ContractProvider> {
    return this.contractProvidersService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Lista todos os fornecedores de contrato',
    description: 'Retorna uma lista de todos os fornecedores de contrato.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de fornecedores de contrato retornada com sucesso.',
      type: FindManyContractProvidersDto,
      isArray: true
    }
  })
  async list(
    @Query() query: FindManyContractProvidersDto
  ): Promise<[ContractProvider[], number]> {
    return this.contractProvidersService.list(query);
  }

  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Busca um fornecedor de contrato por ID',
    description: 'Retorna um fornecedor de contrato específico pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Fornecedor de contrato retornado com sucesso.',
      type: CreateContractProviderDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Fornecedor de contrato não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number): Promise<ContractProvider> {
    return this.contractProvidersService.show(id);
  }

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualiza um fornecedor de contrato',
    description:
      'Atualiza os dados de um fornecedor de contrato existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Fornecedor de contrato atualizado com sucesso.',
      type: UpdateContractProviderDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Fornecedor de contrato não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um fornecedor de contrato com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateContractProviderDto
  ): Promise<ContractProvider> {
    return this.contractProvidersService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deleta um fornecedor de contrato',
    description:
      'Remove permanentemente um fornecedor de contrato pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Fornecedor de contrato deletado com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Fornecedor de contrato não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.contractProvidersService.delete(id);
  }
}
