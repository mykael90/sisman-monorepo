import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { WorkerContract } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  WorkerContractCreateDto,
  WorkerContractUpdateDto
} from './dto/worker-contract.dto';

@Injectable()
export class WorkersContractsService {
  private readonly logger = new Logger(WorkersContractsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: WorkerContractCreateDto): Promise<WorkerContract> {
    this.logger.log(
      `Criando vínculo de contrato de worker com dados: ${JSON.stringify(data)}`
    );

    try {
      return await this.prisma.workerContract.create({
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerContract', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    id: number,
    data: WorkerContractUpdateDto
  ): Promise<WorkerContract> {
    try {
      return await this.prisma.workerContract.update({
        where: { id },
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerContract', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async list(): Promise<WorkerContract[]> {
    return await this.prisma.workerContract.findMany({
      include: {
        worker: true,
        contract: {
          include: {
            providers: true
          }
        },
        workerSpecialty: true,
        sipacUnitLocation: true
      }
    });
  }

  async show(id: number): Promise<WorkerContract> {
    await this.exists(id);
    return await this.prisma.workerContract.findUnique({
      include: {
        worker: true,
        contract: {
          include: {
            providers: true
          }
        },
        workerSpecialty: true,
        sipacUnitLocation: true
      },
      where: { id }
    });
  }

  async delete(id: number): Promise<void> {
    await this.exists(id);
    await this.prisma.workerContract.delete({ where: { id } });
  }

  async exists(id: number): Promise<void> {
    if (!(await this.prisma.workerContract.count({ where: { id } }))) {
      throw new NotFoundException(`WorkerContract ${id} not found`);
    }
  }
}
