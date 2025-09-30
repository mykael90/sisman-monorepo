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

import { WorkersSpecialtiesService } from './workers-specialties.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  WorkerSpecialtyCreateDto,
  WorkerSpecialtyUpdateDto,
  WorkerSpecialtyWithRelationsResponseDto
} from './dto/worker-specialty.dto';

// @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('worker-specialty')
@ApiTags('worker-specialty')
export class WorkersSpecialtiesController {
  constructor(
    private readonly workersSpecialtiesService: WorkersSpecialtiesService
  ) {}

  /**
   * Cria uma nova especialidade de worker.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova especialidade de worker',
    description: 'Cria uma nova especialidade de worker.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Especialidade criada com sucesso.',
      type: WorkerSpecialtyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe uma especialidade com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: WorkerSpecialtyCreateDto) {
    return this.workersSpecialtiesService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar especialidades de workers',
    description: 'Retorna uma lista de todas as especialidades de workers.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de especialidades encontrada.',
      type: WorkerSpecialtyWithRelationsResponseDto,
      isArray: true
    }
  })
  async list() {
    return this.workersSpecialtiesService.list();
  }

  @Roles(Role.Adm, Role.User)
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar especialidade por ID',
    description: 'Retorna uma especialidade específica pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Especialidade encontrada.',
      type: WorkerSpecialtyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Especialidade não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.workersSpecialtiesService.show(id);
  }

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar especialidade',
    description:
      'Atualiza os dados de uma especialidade existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Especialidade atualizada com sucesso.',
      type: WorkerSpecialtyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Especialidade não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe uma especialidade com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: WorkerSpecialtyUpdateDto
  ) {
    return this.workersSpecialtiesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar especialidade',
    description: 'Remove permanentemente uma especialidade pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Especialidade deletada com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Especialidade não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.workersSpecialtiesService.delete(id);
  }
}
