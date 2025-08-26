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
import { Prisma, Worker } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  CreateWorkerWithRelationsDto,
  UpdateWorkerWithRelationsDto
} from './dto/worker.dto';

@Injectable()
export class WorkersService {
  private readonly logger = new Logger(WorkersService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  private readonly includeRelations: Prisma.WorkerInclude = {
    maintenanceInstance: true,
    workerContracts: true
  };

  async create(data: CreateWorkerWithRelationsDto): Promise<Worker> {
    this.logger.log(`Criando worker com dados: ${JSON.stringify(data)}`);
    const { maintenanceInstance, workerContracts, ...restOfData } = data;

    const prismaCreateInput: Prisma.WorkerCreateInput = {
      ...restOfData,
      maintenanceInstance: maintenanceInstance
        ? { connect: { id: maintenanceInstance.id } }
        : undefined,
      workerContracts: workerContracts
        ? {
            create: workerContracts.map((contract) => ({
              contract: { connect: { id: contract.contractId } },
              workerSpecialty: { connect: { id: contract.workerSpecialtyId } },
              sipacUnitLocation: {
                connect: { id: contract.sipacUnitLocationId }
              },
              start: contract.start,
              end: contract.end,
              located: contract.located,
              notes: contract.notes
            }))
          }
        : undefined
    };

    try {
      return await this.prisma.worker.create({
        data: prismaCreateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Worker', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    workerId: number,
    data: UpdateWorkerWithRelationsDto
  ): Promise<Worker> {
    const { maintenanceInstance, workerContracts, ...restOfData } = data;

    const prismaUpdateInput: Prisma.WorkerUpdateInput = {
      ...restOfData
    };

    if (maintenanceInstance) {
      prismaUpdateInput.maintenanceInstance = maintenanceInstance.id
        ? { connect: { id: maintenanceInstance.id } }
        : { disconnect: true };
    }

    if (workerContracts) {
      // Primeiro removemos todos os contratos existentes
      await this.prisma.workerContract.deleteMany({
        where: { workerId }
      });

      // Depois recriamos com os novos dados
      prismaUpdateInput.workerContracts = {
        create: workerContracts.map((contract) => ({
          contract: { connect: { id: contract.contractId } },
          workerSpecialty: { connect: { id: contract.workerSpecialtyId } },
          sipacUnitLocation: { connect: { id: contract.sipacUnitLocationId } },
          start: contract.start,
          end: contract.end,
          located: contract.located,
          notes: contract.notes
        }))
      };
    }

    try {
      return await this.prisma.worker.update({
        where: { id: workerId },
        data: prismaUpdateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Worker', {
        operation: 'update',
        workerId: workerId,
        data: prismaUpdateInput
      });
      throw error;
    }
  }

  async list() {
    return await this.prisma.worker.findMany({
      include: this.includeRelations
    });
  }

  async show(id: number) {
    await this.exists(id);
    return await this.prisma.worker.findUnique({
      where: { id },
      include: this.includeRelations
    });
  }

  async delete(id: number) {
    await this.exists(id);
    return await this.prisma.worker.delete({ where: { id } });
  }

  async exists(id: number) {
    if (!(await this.prisma.worker.count({ where: { id } }))) {
      throw new NotFoundException(`Worker ${id} not found`);
    }
  }
}
