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

import { WorkersService } from './workers.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  CreateWorkerWithRelationsDto,
  UpdateWorkerWithRelationsDto,
  WorkerWithRelationsResponseDto
} from './dto/worker.dto';

// @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('worker')
@ApiTags('worker')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  /**
   * Cria um novo worker.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo worker',
    description: 'Cria um novo worker com as relações especificadas.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Worker criado com sucesso.',
      type: WorkerWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe um worker com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: CreateWorkerWithRelationsDto) {
    return this.workersService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar workers',
    description: 'Retorna uma lista de todos os workers.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de workers encontrada.',
      type: WorkerWithRelationsResponseDto,
      isArray: true
    }
  })
  async list() {
    return this.workersService.list();
  }

  @Roles(Role.Adm, Role.User)
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar worker por ID',
    description: 'Retorna um worker específico pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Worker encontrado.',
      type: WorkerWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Worker não encontrado.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.workersService.show(id);
  }

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar worker',
    description: 'Atualiza os dados de um worker existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Worker atualizado com sucesso.',
      type: WorkerWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Worker não encontrado.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe um worker com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateWorkerWithRelationsDto
  ) {
    return this.workersService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar worker',
    description: 'Remove permanentemente um worker pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Worker deletado com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Worker não encontrado.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.workersService.delete(id);
  }
}
