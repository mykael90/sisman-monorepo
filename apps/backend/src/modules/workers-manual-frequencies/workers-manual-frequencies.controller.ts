import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';

import { WorkersManualFrequenciesService } from './workers-manual-frequencies.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  WorkerManualFrequencyCreateDto,
  WorkerManualFrequencyUpdateDto,
  WorkerManualFrequencyWithRelationsResponseDto
} from './dto/worker-manual-frequency.dto';

// @Roles(Role.Adm)
// @UseGuards(AuthGuard, RoleGuard)
@Controller('worker-manual-frequency')
@ApiTags('worker-manual-frequency')
export class WorkersManualFrequenciesController {
  constructor(
    private readonly workersManualFrequenciesService: WorkersManualFrequenciesService
  ) {}

  /**
   * Cria uma nova frequência manual de worker.
   */
  @Post()
  @ApiEndpointSwagger({
    summary: 'Criar nova frequência manual de worker',
    description: 'Cria uma nova frequência manual de worker.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Frequência manual criada com sucesso.',
      type: WorkerManualFrequencyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe uma frequência manual com os dados fornecidos.'
      }
    ]
  })
  async create(@Body() data: WorkerManualFrequencyCreateDto) {
    return this.workersManualFrequenciesService.create(data);
  }

  @Get()
  @ApiEndpointSwagger({
    summary: 'Listar frequências manuais de workers',
    description:
      'Retorna uma lista de todas as frequências manuais de workers.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de frequências manuais encontrada.',
      type: WorkerManualFrequencyWithRelationsResponseDto,
      isArray: true
    }
  })
  async list() {
    return this.workersManualFrequenciesService.list();
  }

  @Get(':workerId/:date')
  @ApiEndpointSwagger({
    summary: 'Buscar frequência manual por ID',
    description: 'Retorna uma frequência manual específica pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Frequência manual encontrada.',
      type: WorkerManualFrequencyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Frequência manual não encontrada.'
      }
    ]
  })
  async show(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Param('date', ParseDatePipe) date: Date
  ) {
    return this.workersManualFrequenciesService.show(workerId, date);
  }

  @Put(':workerId/:date')
  @ApiEndpointSwagger({
    summary: 'Atualizar frequência manual',
    description:
      'Atualiza os dados de uma frequência manual existente pelo seu ID.',
    response: {
      status: HttpStatus.OK,
      description: 'Frequência manual atualizada com sucesso.',
      type: WorkerManualFrequencyWithRelationsResponseDto
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Frequência manual não encontrada.'
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description: 'Já existe uma frequência manual com os dados fornecidos.'
      }
    ]
  })
  async update(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Param('date', ParseDatePipe) date: Date,
    @Body() data: WorkerManualFrequencyUpdateDto
  ) {
    return this.workersManualFrequenciesService.update(workerId, date, data);
  }

  @Delete(':workerId/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpointSwagger({
    summary: 'Deletar frequência manual',
    description: 'Remove permanentemente uma frequência manual pelo seu ID.',
    response: {
      status: HttpStatus.NO_CONTENT,
      description: 'Frequência manual deletada com sucesso.'
    },
    errors: [
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Frequência manual não encontrada.'
      }
    ]
  })
  async delete(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Param('date', ParseDatePipe) date: Date
  ): Promise<void> {
    await this.workersManualFrequenciesService.delete(workerId, date);
  }
}
