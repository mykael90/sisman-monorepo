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

import { WorkersManualFrequenciesTypesService } from './workers-manual-frequencies-types.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  WorkerManualFrequencyTypeCreateDto,
  WorkerManualFrequencyTypeUpdateDto,
  WorkerManualFrequencyTypeWithRelationsResponseDto
} from './dto/worker-manual-frequency-type.dto';

// @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('worker-manual-frequency-type')
@ApiTags('worker-manual-frequency-type')
export class WorkersManualFrequenciesTypesController {
  constructor(
    private readonly workersManualFrequenciesTypesService: WorkersManualFrequenciesTypesService
  ) {}

  /**
   * Cria um novo tipo de frequência manual de worker.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar novo tipo de frequência manual de worker',
    description: 'Cria um novo tipo de frequência manual de worker.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Tipo de frequência manual criada com sucesso.',
      type: WorkerManualFrequencyTypeWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de frequência manual com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: WorkerManualFrequencyTypeCreateDto) {
    return this.workersManualFrequenciesTypesService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar tipos de frequências manuais de workers',
    description:
      'Retorna uma lista de todos os tipos de frequências manuais de workers.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de tipos de frequências manuais encontrada.',
      type: WorkerManualFrequencyTypeWithRelationsResponseDto,
      isArray: true
    }
  })
  async list() {
    return this.workersManualFrequenciesTypesService.list();
  }

  @Roles(Role.Adm, Role.User)
  @Get(':id')
  @ApiEndpointSwagger({
    summary: 'Buscar tipo de frequência manual por ID',
    description: 'Retorna um tipo de frequência manual específico pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Tipo de frequência manual encontrada.',
      type: WorkerManualFrequencyTypeWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de frequência manual não encontrada.'
      }
    ]
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.workersManualFrequenciesTypesService.show(id);
  }

  @Put(':id')
  @ApiEndpointSwagger({
    summary: 'Atualizar tipo de frequência manual',
    description:
      'Atualiza os dados de um tipo de frequência manual existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Tipo de frequência manual atualizada com sucesso.',
      type: WorkerManualFrequencyTypeWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de frequência manual não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe um tipo de frequência manual com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: WorkerManualFrequencyTypeUpdateDto
  ) {
    return this.workersManualFrequenciesTypesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar tipo de frequência manual',
    description:
      'Remove permanentemente um tipo de frequência manual pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Tipo de frequência manual deletada com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Tipo de frequência manual não encontrada.'
      }
    ]
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.workersManualFrequenciesTypesService.delete(id);
  }
}
