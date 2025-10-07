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

  async create(
    data: CreateWorkerWithRelationsDto,
    tx?: Prisma.TransactionClient
  ) {
    try {
      if (tx) {
        this.logger.log(
          `Executando a criação dentro de uma transação existente.`
        );
        return await this._create(data, tx as any);
      }
      this.logger.log(`Iniciando uma nova transação para criação.`);
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._create(data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Worker', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async _create(
    data: CreateWorkerWithRelationsDto,
    prisma: Prisma.TransactionClient
  ): Promise<Worker> {
    this.logger.log(`Criando worker com dados: ${JSON.stringify(data)}`);
    const { workerContracts, ...restOfData } = data;

    const prismaCreateInput: Prisma.WorkerCreateInput = {
      ...restOfData,
      workerContracts: workerContracts
        ? {
            create: workerContracts.map((contract) => ({
              contract: { connect: { id: contract.contractId } },
              workerSpecialty: { connect: { id: contract.workerSpecialtyId } },
              sipacUnitLocation: {
                connect: { id: contract.sipacUnitLocationId }
              },
              start: contract.startDate,
              end: contract.endDate,
              notes: contract.notes
            }))
          }
        : undefined
    };

    try {
      return await prisma.worker.create({
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
    id: number,
    data: UpdateWorkerWithRelationsDto,
    tx?: Prisma.TransactionClient
  ) {
    try {
      if (tx) {
        this.logger.log(
          `Executando a ataulização dentro de uma transação existente.`
        );
        return await this._update(id, data, tx as any);
      }
      this.logger.log(`Iniciando uma nova transação para atualização.`);
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._update(id, data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Worker', {
        operation: 'update',
        data
      });
      throw error;
    }
  }

  private async _update(
    workerId: number,
    data: UpdateWorkerWithRelationsDto,
    prisma: Prisma.TransactionClient
  ): Promise<Worker> {
    const { workerContracts, ...restOfData } = data;

    const prismaUpdateInput: Prisma.WorkerUpdateInput = {
      ...restOfData
    };

    if (workerContracts && workerContracts.length > 0) {
      prismaUpdateInput.workerContracts = {
        upsert: workerContracts.map((contract) => ({
          where: {
            id: contract.id
          },
          create: {
            contractId: contract.contractId,
            workerSpecialtyId: contract.workerSpecialtyId,
            sipacUnitLocationId: contract.sipacUnitLocationId,
            startDate: contract.startDate,
            endDate: contract.endDate,
            notes: contract.notes
          },
          update: {
            contractId: contract.contractId,
            workerSpecialtyId: contract.workerSpecialtyId,
            sipacUnitLocationId: contract.sipacUnitLocationId,
            startDate: contract.startDate,
            endDate: contract.endDate,
            notes: contract.notes
          }
        }))
      };
    }

    try {
      return await prisma.worker.update({
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
      include: {
        maintenanceInstance: true,
        workerContracts: {
          include: {
            contract: {
              include: {
                providers: true
              }
            },
            workerSpecialty: true,
            sipacUnitLocation: true
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async listWithActiveContract() {
    return await this.prisma.worker.findMany({
      include: {
        maintenanceInstance: true,
        workerContracts: {
          include: {
            contract: {
              include: {
                providers: true
              }
            },
            workerSpecialty: true,
            sipacUnitLocation: true
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      where: {
        workerContracts: {
          some: {
            endDate: null
          }
        }
      }
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
