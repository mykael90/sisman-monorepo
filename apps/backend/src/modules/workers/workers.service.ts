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
import { AttachmentsService } from '../../shared/attachments/attachments.service';

@Injectable()
export class WorkersService {
  private readonly logger = new Logger(WorkersService.name);

  constructor(
    private readonly attachmentsService: AttachmentsService,
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
    const { workerContracts, attachmentData, ...restOfData } = data;

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
      const worker = await prisma.worker.create({
        data: prismaCreateInput,
        include: this.includeRelations
      });

      //Se contiver anexo, chamar o serviço
      // Chama o serviço de anexo para criar o anexo dentro da transação
      attachmentData?.file &&
        (await this.attachmentsService.create(
          {
            file: attachmentData.file,
            userId: attachmentData.userId,
            relatedId: worker.id,
            relatedModel: Prisma.ModelName.Worker
          },
          prisma
        ));

      // Finaliza a transação e retorna o trabalhador
      return worker;
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

  async list(queryParams?: { [key: string]: string }) {
    const whereArgs: Prisma.WorkerWhereInput = {};

    if (queryParams && !!Object.keys(queryParams).length) {
      const { isActive } = queryParams;
      if (isActive) {
        whereArgs.isActive = isActive === 'true';
      }
    }

    return await this.prisma.worker.findMany({
      where: whereArgs,
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

  async listWithAttachments(queryParams?: { [key: string]: string }) {
    const whereArgs: Prisma.WorkerWhereInput = {};

    if (queryParams && !!Object.keys(queryParams).length) {
      const { isActive } = queryParams;
      if (isActive) {
        whereArgs.isActive = isActive === 'true';
      }
    }

    const workers = await this.prisma.worker.findMany({
      where: whereArgs,
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

    const workerIds = workers.map((w) => String(w.id));

    const attachments = await this.prisma.attachment.findMany({
      where: {
        relatedId: { in: workerIds },
        relatedModel: Prisma.ModelName.Worker
      }
    });

    const attachmentsMap = new Map<string, any[]>();
    for (const a of attachments) {
      if (!attachmentsMap.has(a.relatedId)) {
        attachmentsMap.set(a.relatedId, []);
      }
      attachmentsMap.get(a.relatedId)!.push(a);
    }

    const response = workers.map((worker) => ({
      ...worker,
      attachments: attachmentsMap.get(String(worker.id)) ?? []
    }));

    response.sort((a, b) => a.name.localeCompare(b.name));

    this.logger.log(`Retornando ${response.length} workers`);

    return response;
  }

  async show(id: number) {
    await this.exists(id);
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: this.includeRelations
    });

    //consultar foto do worker
    const attachments = await this.prisma.attachment.findMany({
      where: {
        relatedId: String(id),
        relatedModel: Prisma.ModelName.Worker
      }
    });

    return {
      ...worker,
      attachments: attachments
    };
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

  async listWorkersWithdrawals(queryParams?: {
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const whereArgs: Prisma.WorkerWhereInput = {};

      if (queryParams && Object.keys(queryParams).length) {
        const { startDate, endDate } = queryParams;

        if (startDate && endDate) {
          // whereArgs.id = 191;
          whereArgs.withdrawalsCollected = {
            every: {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            }
          };
        }
      }

      return await this.prisma.worker.findMany({
        include: {
          withdrawalsCollected: {
            include: { items: { include: { globalMaterial: true } } }
          }
        },
        where: whereArgs,
        orderBy: {
          name: 'asc'
        }
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkersService', {
        operation: 'MaterialStockMovementsService'
      });
      throw error;
    }
  }
}
