import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import {
  CreateMaterialWithdrawalWithRelationsDto,
  UpdateMaterialWithdrawalWithRelationsDto,
  MaterialWithdrawalWithRelationsResponseDto
} from './dto/material-withdrawal.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  Prisma,
  MaterialStockOperationSubType,
  PrismaClient
} from '@sisman/prisma';
import { MaterialStockMovementsService } from '../material-stock-movements/material-stock-movements.service';
import { CreateMaterialStockMovementWithRelationsDto } from '../material-stock-movements/dto/material-stock-movements.dto';
import { MaterialRequestsService } from '../material-requests/material-requests.service';
import { WarehousesService } from '../warehouses/warehouses.service';

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class MaterialWithdrawalsService {
  private readonly logger = new Logger(MaterialWithdrawalsService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly materialStockMovementsService: MaterialStockMovementsService,
    private readonly materialRequestsService: MaterialRequestsService,
    private readonly warehousesService: WarehousesService
  ) {}

  private readonly includeRelations: Prisma.MaterialWithdrawalInclude = {
    warehouse: true,
    processedByUser: true,
    collectedByUser: true,
    collectedByWorker: true,
    maintenanceRequest: true,
    materialRequest: true,
    materialPickingOrder: true,
    movementType: true,
    items: true
  };

  /**
   * Método público para criar uma ordem de separação.
   * Gerencia a transação: inicia uma nova ou utiliza uma existente.
   */
  async create(
    data: CreateMaterialWithdrawalWithRelationsDto,
    tx?: Prisma.TransactionClient
  ): Promise<MaterialWithdrawalWithRelationsResponseDto> {
    try {
      if (tx) {
        this.logger.log(
          `Executando a criação dentro de uma transação existente.`
        );
        return await this._createWithdrawalLogic(data, tx as any);
      }

      this.logger.log(
        `Iniciando uma nova transação para criar a retirada de material.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._createWithdrawalLogic(
          data,
          prismaTransactionClient as any
        );
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWithdrawalsService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async _createWithdrawalLogic(
    data: CreateMaterialWithdrawalWithRelationsDto,
    prisma: PrismaClient
  ): Promise<MaterialWithdrawalWithRelationsResponseDto> {
    const {
      warehouse,
      processedByUser,
      collectedByUser,
      collectedByWorker,
      maintenanceRequest,
      materialRequest,
      materialPickingOrder,
      movementType,
      items,
      ...restOfData
    } = data;

    const withdrawalCreateInput: Prisma.MaterialWithdrawalCreateInput = {
      ...restOfData,
      warehouse: warehouse?.id ? { connect: { id: warehouse.id } } : undefined,
      processedByUser: processedByUser?.id
        ? { connect: { id: processedByUser.id } }
        : undefined,
      collectedByUser: collectedByUser?.id
        ? { connect: { id: collectedByUser.id } }
        : undefined,
      collectedByWorker: collectedByWorker?.id
        ? { connect: { id: collectedByWorker.id } }
        : undefined,
      maintenanceRequest: maintenanceRequest?.id
        ? { connect: { id: maintenanceRequest.id } }
        : undefined,
      materialRequest: materialRequest?.id
        ? { connect: { id: materialRequest.id } }
        : undefined,
      materialPickingOrder: materialPickingOrder?.id
        ? { connect: { id: materialPickingOrder.id } }
        : undefined,
      movementType: movementType?.code
        ? { connect: { code: movementType.code } }
        : undefined,
      items: {
        create: items.map((item) => ({
          globalMaterial: item.globalMaterialId
            ? { connect: { id: item.globalMaterialId } }
            : undefined,
          materialInstance: item.materialInstanceId
            ? { connect: { id: item.materialInstanceId } }
            : undefined,
          quantityWithdrawn: item.quantityWithdrawn,
          materialRequestItem: item.materialRequestItemId
            ? { connect: { id: item.materialRequestItemId } }
            : undefined
        }))
      }
    };

    this.logger.log(`Iniciando criação da retirada/saída de material...`);
    //Etapa 0 verificar para os itens que tem saldo inicial definido se a saída/retirada é possível
    await this._canWithdrawWarehouseStock(
      prisma as any,
      warehouse.id,
      items.map((item) => ({
        globalMaterialId: item.globalMaterialId,
        quantityWithdrawn: item.quantityWithdrawn
      }))
    );

    // Etapa 01 se a retirada estiver relacionada a uma requisição de material, verificar o saldo efetivo livre dos itens
    if (materialRequest?.id) {
      await this._canWithdrawWithMaterialRequest(
        materialRequest.id,
        items.map((item) => ({
          materialRequestItemId: item.materialRequestItemId,
          quantityWithdrawn: item.quantityWithdrawn
        }))
      );
    }

    // ETAPA 1: Criar a Retirada de Material e seus Itens.
    const newWithdrawal = await prisma.materialWithdrawal.create({
      data: withdrawalCreateInput,
      include: {
        items: {
          include: {
            globalMaterial: true,
            materialInstance: true,
            materialRequestItem: true
          }
        }
      }
    });

    this.logger.log(
      `Retirada de material nº ${newWithdrawal.id} e seus ${newWithdrawal.items.length} itens criados.`
    );

    this.logger.log(`Iniciando criação das movimentações de estoque...`);

    // ETAPA 2: Iterar sobre CADA item criado para gerar a movimentação de estoque.
    for (const createdItem of newWithdrawal.items) {
      const materialStockMovement: CreateMaterialStockMovementWithRelationsDto =
        {
          quantity: createdItem.quantityWithdrawn,
          warehouse: { id: warehouse.id } as any,
          movementType: { code: movementType.code } as any,
          processedByUser: { id: processedByUser.id } as any,
          collectedByUser: collectedByUser?.id
            ? ({ id: collectedByUser.id } as any)
            : undefined,
          collectedByWorker: collectedByWorker?.id
            ? ({ id: collectedByWorker.id } as any)
            : undefined,
          globalMaterial: createdItem.globalMaterialId
            ? ({ id: createdItem.globalMaterialId } as any)
            : undefined,
          materialInstance: createdItem.materialInstanceId
            ? ({ id: createdItem.materialInstanceId } as any)
            : undefined,
          materialRequestItem: createdItem.materialRequestItem?.id
            ? ({ id: createdItem.materialRequestItem.id } as any)
            : undefined,
          materialWithdrawalItem: { id: createdItem.id } as any,
          maintenanceRequest: maintenanceRequest?.id
            ? ({ id: maintenanceRequest.id } as any)
            : undefined
        };

      // Chama o serviço de movimentação, passando o cliente da transação (tx)
      await this.materialStockMovementsService.create(
        materialStockMovement,
        prisma as any
      );
      this.logger.log(
        `Movimentação para o item ${createdItem.id} criada com sucesso.`
      );
    }

    this.logger.log(`Todas as movimentações de estoque foram criadas.`);

    // ETAPA 3: Retornar a retirada completa com todas as relações definidas em `includeRelations`.
    return prisma.materialWithdrawal.findUniqueOrThrow({
      where: { id: newWithdrawal.id },
      include: this.includeRelations
    });
  }

  async update(
    id: number,
    data: UpdateMaterialWithdrawalWithRelationsDto
  ): Promise<MaterialWithdrawalWithRelationsResponseDto> {
    const {
      warehouse,
      processedByUser,
      collectedByUser,
      collectedByWorker,
      maintenanceRequest,
      materialRequest,
      materialPickingOrder,
      movementType,
      items,
      ...restOfData
    } = data;

    const updateInput: Prisma.MaterialWithdrawalUpdateInput = {
      ...restOfData
    };

    if (warehouse?.id)
      updateInput.warehouse = { connect: { id: warehouse.id } };
    if (processedByUser?.id)
      updateInput.processedByUser = { connect: { id: processedByUser.id } };
    if (collectedByUser?.id)
      updateInput.collectedByUser = { connect: { id: collectedByUser.id } };
    if (collectedByWorker?.id)
      updateInput.collectedByWorker = { connect: { id: collectedByWorker.id } };
    if (maintenanceRequest?.id)
      updateInput.maintenanceRequest = {
        connect: { id: maintenanceRequest.id }
      };
    if (materialRequest?.id)
      updateInput.materialRequest = { connect: { id: materialRequest.id } };
    if (materialPickingOrder?.id)
      updateInput.materialPickingOrder = {
        connect: { id: materialPickingOrder.id }
      };
    if (movementType?.code)
      updateInput.movementType = { connect: { code: movementType.code } };

    // TODO: Implement logic to update nested items if needed.
    // This would involve checking for existing items, creating new ones, or deleting old ones.
    // if (items && items.length > 0) {
    //   updateInput.items = {
    //     upsert: items.map((item) => ({
    //       where: { id: item.id }, // 'id' is required for upsert where clause
    //       create: {
    //         globalMaterial: item.globalMaterialId
    //           ? { connect: { id: item.globalMaterialId } }
    //           : undefined,
    //         materialInstance: item.materialInstanceId
    //           ? { connect: { id: item.materialInstanceId } }
    //           : undefined,
    //         quantityWithdrawn: item.quantityWithdrawn,
    //         materialRequestItem: item.materialRequestItemId
    //           ? { connect: { id: item.materialRequestItemId } }
    //           : undefined
    //       },
    //       update: {
    //         globalMaterial: item.globalMaterialId
    //           ? { connect: { id: item.globalMaterialId } }
    //           : undefined,
    //         materialInstance: item.materialInstanceId
    //           ? { connect: { id: item.materialInstanceId } }
    //           : undefined,
    //         quantityWithdrawn: item.quantityWithdrawn,
    //         materialRequestItem: item.materialRequestItemId
    //           ? { connect: { id: item.materialRequestItemId } }
    //           : undefined
    //       }
    //     }))
    //   };
    // }

    try {
      return this.prisma.materialWithdrawal.update({
        where: { id },
        data: updateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWithdrawalsService', {
        operation: 'update',
        id,
        data: updateInput
      });
      throw error;
    }
  }

  async delete(id: number): Promise<{ message: string; id: number }> {
    try {
      await this.prisma.materialWithdrawal.delete({ where: { id } });
      return {
        message: 'Material Withdrawal deleted successfully',
        id: id
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWithdrawalsService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }

  async list(): Promise<MaterialWithdrawalWithRelationsResponseDto[]> {
    try {
      return this.prisma.materialWithdrawal.findMany({
        include: this.includeRelations,
        orderBy: {
          withdrawalDate: 'desc'
        }
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWithdrawalsService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async listByWarehouse(warehouseId: number) {
    try {
      return this.prisma.materialWithdrawal.findMany({
        where: { warehouseId: warehouseId },
        include: this.includeRelations,
        orderBy: {
          withdrawalDate: 'desc'
        }
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWithdrawalsService', {
        operation: 'listByWarehouse'
      });
      throw error;
    }
  }

  async show(id: number): Promise<MaterialWithdrawalWithRelationsResponseDto> {
    try {
      const materialWithdrawal =
        await this.prisma.materialWithdrawal.findUnique({
          where: { id },
          include: this.includeRelations
        });
      if (!materialWithdrawal) {
        throw new NotFoundException(
          `Material Withdrawal with ID ${id} not found`
        );
      }
      return materialWithdrawal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaterialWithdrawalsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  /**
   * Valida se uma retirada de estoque geral do almoxarifado pode ser realizada.
   *
   * @param tx O cliente Prisma da transação.
   * @param warehouseId O ID do almoxarifado.
   * @param itemsToWithdraw Os itens a serem retirados.
   * @param withdrawalIdToExclude O ID de uma retirada existente a ser ignorada (para cenários de atualização).
   */
  private async _canWithdrawWarehouseStock(
    tx: PrismaClient,
    warehouseId: number,
    itemsToWithdraw: Array<{
      quantityWithdrawn: Prisma.Decimal;
      globalMaterialId: string;
    }>,
    withdrawalIdToExclude?: number
  ): Promise<void> {
    // Chamamos o método genérico, adaptando os dados e passando a configuração correta.
    await this.warehousesService.validateWarehouseOperation(
      tx,
      warehouseId,
      // Adapta o formato do array de entrada para o formato genérico
      itemsToWithdraw.map((item) => ({
        globalMaterialId: item.globalMaterialId,
        quantity: item.quantityWithdrawn
      })),
      // Configura a operação como uma 'WITHDRAWAL'
      {
        type: 'WITHDRAWAL',
        idToExclude: { withdrawalId: withdrawalIdToExclude }
      }
    );
  }

  /**
   * Valida se uma nova retirada pode ser criada ou atualizada.
   * Verifica contra o saldo efetivo potencial (pode ainda nao estar efetivamente, mas ta garantido de chegar).
   */
  private async _canWithdrawWithMaterialRequest(
    materialRequestId: number,
    itemsToWithdraw: Array<{
      quantityWithdrawn: Prisma.Decimal;
      materialRequestItemId: number;
    }>,
    withdrawalIdToExclude?: number
  ): Promise<void> {
    await this.materialRequestsService.validateOperationAgainstBalance(
      materialRequestId,
      itemsToWithdraw.map((item) => ({
        materialRequestItemId: item.materialRequestItemId,
        quantity: item.quantityWithdrawn
      })),
      {
        type: 'WITHDRAWAL',
        balanceToCheck: 'potential', // Retiradas consomem o que está fisicamente disponível
        idToExclude: { withdrawalIdToExclude }
      }
    );
  }
}
