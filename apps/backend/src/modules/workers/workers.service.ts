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
import { CreateAttachmentDto } from '../../shared/attachments/dto/attachment.dto';
import { at } from 'lodash';
import { join } from 'path';

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

      //Anexar arquivo junto com criação
      //Inseri algumas informações no DTO
      if (attachmentData?.file) {
        function getDestinationDirectory() {
          return join(__dirname, '..', '..', '..', 'storage', 'photos');
        }

        const fileName = `photo-${worker.id}-${Date.now()}.jpg`;

        ((attachmentData.localPath = join(getDestinationDirectory(), fileName)),
          (attachmentData.relatedId = String(worker.id)),
          (attachmentData.relatedModel = 'Worker'),
          (attachmentData.userId = 1),
          (attachmentData.storedFileName = fileName),
          (attachmentData.url =
            'https://storage.exemplo.com/uploads/a1b2c3d4e5f6.jpg'));

        // Chama o serviço de anexo para criar o anexo dentro da transação
        await this.attachmentsService.create(attachmentData, prisma);
      }

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
