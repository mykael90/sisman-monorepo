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

import { WorkersManualFrequenciesService } from './workers-manual-frequencies.service';
import { CustomParseDatePipe } from '../../shared/pipes/parse-date.pipe';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/auth/guards/role.guard';
import { AuthGuard } from 'src/shared/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpointSwagger } from '../../shared/decorators/swagger/api-endpoint.decorator';
import {
  WorkerManualFrequencyCreateDto,
  WorkerManualFrequencyCreateManyDto,
  WorkerManualFrequencyUpdateDto,
  WorkerManualFrequencyWithRelationsResponseDto
} from './dto/worker-manual-frequency.dto';

// @Roles(Role.Adm)
@UseGuards(AuthGuard, RoleGuard)
@Controller('worker-manual-frequency')
@ApiTags('worker-manual-frequency')
export class WorkersManualFrequenciesController {
  constructor(
    private readonly workersManualFrequenciesService: WorkersManualFrequenciesService
  ) {}

  /**
   * Cria uma nova frequência manual de worker.
   */
  @Roles(Role.AdmWorkers, Role.SuperWorkers)
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

  /**
   * Cria múltiplas frequências manuais de worker.
   */
  @Roles(Role.AdmWorkers, Role.SuperWorkers)
  @Post('many')
  @HttpCode(HttpStatus.CREATED)
  @ApiEndpointSwagger({
    summary: 'Criar múltiplas frequências manuais de worker',
    description: 'Cria múltiplas frequências manuais de worker.',
    response: {
      status: HttpStatus.CREATED,
      description: 'Frequências manuais criadas com sucesso.',
      type: WorkerManualFrequencyWithRelationsResponseDto,
      isArray: true
    },
    errors: [
      {
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos ou formato incorreto.'
      },
      {
        status: HttpStatus.CONFLICT,
        description:
          'Já existe uma ou mais frequências manuais com os dados fornecidos.'
      }
    ]
  })
  async createMany(@Body() data: WorkerManualFrequencyCreateManyDto) {
    return this.workersManualFrequenciesService.createMany(data);
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

  @Get('with-contracts')
  @ApiEndpointSwagger({
    summary: 'Listar frequências manuais de workers com contratos',
    description:
      'Retorna uma lista de todas as frequências manuais de workers, incluindo informações de contrato.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de frequências manuais com contratos encontrada.',
      type: WorkerManualFrequencyWithRelationsResponseDto, // Assuming this DTO is suitable, or a new one might be needed
      isArray: true
    }
  })
  async getFrequenciesWithContracts(
    @Query()
    queryParams: {
      [key: string]: string;
    }
  ) {
    return this.workersManualFrequenciesService.getFrequenciesWithContracts(
      queryParams
    );
  }

  @Get('for-contracts')
  @ApiEndpointSwagger({
    summary: 'Listar frequências para contratos',
    description:
      'Retorna uma lista de contratos com suas frequências manuais de workers.',
    response: {
      status: HttpStatus.OK,
      description: 'Lista de contratos com frequências manuais encontrada.',
      type: WorkerManualFrequencyWithRelationsResponseDto, // Pode ser necessário um DTO específico para esta resposta
      isArray: true
    }
  })
  async getFrequenciesForContracts(
    @Query()
    queryParams: {
      [key: string]: string;
    }
  ) {
    return this.workersManualFrequenciesService.getFrequenciesForContracts(
      queryParams
    );
  }

  @Get(':id')
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
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.workersManualFrequenciesService.show(id);
  }

  @Roles(Role.AdmWorkers, Role.SuperWorkers)
  @Put(':id')
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
    @Param('id', ParseIntPipe) id: number,
    @Body() data: WorkerManualFrequencyUpdateDto
  ) {
    return this.workersManualFrequenciesService.update(id, data);
  }

  @Roles(Role.AdmWorkers, Role.SuperWorkers)
  @Delete(':id')
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
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.workersManualFrequenciesService.delete(id);
  }
}
