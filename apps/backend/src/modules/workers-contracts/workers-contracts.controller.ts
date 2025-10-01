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

import { WorkersContractsService } from './workers-contracts.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  WorkerContractCreateDto,
  WorkerContractUpdateDto,
  WorkerContractWithRelationsResponseDto
} from './dto/worker-contract.dto';

// @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('worker-contract')
@ApiTags('worker-contract')
export class WorkersContractsController {
  constructor(
    private readonly workersContractsService: WorkersContractsService
  ) {}

  /**
   * Cria um novo vínculo de contrato de worker.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo vínculo de contrato de worker',
    description: 'Cria um novo vínculo de contrato de worker.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Vínculo de contrato criado com sucesso.',
      type: WorkerContractWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe um vínculo de contrato com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: WorkerContractCreateDto) {
    return this.workersContractsService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar vínculos de contrato de workers',
    description:
      'Retorna uma lista de todos os vínculos de contrato de workers.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de vínculos de contrato encontrada.',
      type: WorkerContractWithRelationsResponseDto,
      isArray: true
    }
  })
  async list() {
    return this.workersContractsService.list();
  }

  @Roles(Role.Adm, Role.User)
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar vínculo de contrato por ID',
    description: 'Retorna um vínculo de contrato específico pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Vínculo de contrato encontrado.',
      type: WorkerContractWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Vínculo de contrato não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.workersContractsService.show(id);
  }

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar vínculo de contrato',
    description:
      'Atualiza os dados de um vínculo de contrato existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Vínculo de contrato atualizado com sucesso.',
      type: WorkerContractWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Vínculo de contrato não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe um vínculo de contrato com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: WorkerContractUpdateDto
  ) {
    return this.workersContractsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar vínculo de contrato',
    description: 'Remove permanentemente um vínculo de contrato pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Vínculo de contrato deletado com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Vínculo de contrato não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.workersContractsService.delete(id);
  }
}
