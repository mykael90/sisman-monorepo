import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialRestrictionOrderWithRelationsDto,
  UpdateMaterialRestrictionOrderWithRelationsDto,
  MaterialRestrictionOrderWithRelationsResponseDto,
  UpdateMaterialRestrictionOrderItemDto
} from './dto/material-restriction-order.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  MaterialStockOperationSubType,
  Prisma,
  RestrictionOperationType,
  MaterialRestrictionOrderItem,
  RestrictionOrderStatus
} from '@sisman/prisma';
import { MaterialStockMovementsService } from '../material-stock-movements/material-stock-movements.service';
import { CreateMaterialStockMovementWithRelationsDto } from '../material-stock-movements/dto/material-stock-movements.dto';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class MaterialRestrictionOrdersService {
  private readonly logger = new Logger(MaterialRestrictionOrdersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly materialStockMovementsService: MaterialStockMovementsService
  ) {}

  private readonly includeRelations: Prisma.MaterialRestrictionOrderInclude = {
    warehouse: true,
    processedByUser: true,
    targetMaterialRequest: {
      include: {
        items: true
      }
    },
    items: {
      include: {
        globalMaterial: true,
        materialInstance: true,
        targetMaterialRequestItem: true
      }
    }
  };

  /**
   * Utilitário para criar movimentos de estoque de forma consistente.
   */
  private async _createStockMovement(
    tx: PrismaTransactionClient,
    params: {
      item: {
        id: number;
        globalMaterialId: string;
        materialInstanceId?: number;
        targetMaterialRequestItemId?: number;
      };
      quantityChange: Decimal;
      order: {
        warehouseId: number;
        processedByUserId: number;
        targetMaterialRequest?: { maintenanceRequestId?: number };
      };
    }
  ) {
    if (params.quantityChange.isZero()) return;

    const movementType = params.quantityChange.isPositive()
      ? MaterialStockOperationSubType.RESTRICT_FOR_PAID_ITEM
      : MaterialStockOperationSubType.RELEASE_PAID_RESTRICTION;

    const movementPayload: CreateMaterialStockMovementWithRelationsDto = {
      quantity: params.quantityChange.abs(),
      globalMaterial: { id: params.item.globalMaterialId } as any,
      materialInstance: params.item.materialInstanceId
        ? ({ id: params.item.materialInstanceId } as any)
        : undefined,
      warehouse: { id: params.order.warehouseId } as any,
      processedByUser: { id: params.order.processedByUserId } as any,
      movementType: { code: movementType } as any,
      materialRestrictionItem: { id: params.item.id } as any,
      materialRequestItem: params.item.targetMaterialRequestItemId
        ? ({ id: params.item.targetMaterialRequestItemId } as any)
        : undefined,
      maintenanceRequest: params.order.targetMaterialRequest
        ?.maintenanceRequestId
        ? ({
            id: params.order.targetMaterialRequest.maintenanceRequestId
          } as any)
        : undefined
    };

    await this.materialStockMovementsService.create(movementPayload, tx as any);
  }

  /**
   * #1 & #4: Calcula o status da ordem comparando com a MaterialRequest.
   */
  private async _calculateRestrictionStatus(
    tx: PrismaTransactionClient,
    targetMaterialRequestId: number,
    restrictionItems: { quantityRestricted: Decimal }[]
  ): Promise<RestrictionOrderStatus> {
    const totalRestricted = restrictionItems.reduce(
      (sum, item) => sum.add(item.quantityRestricted),
      new Decimal(0)
    );

    if (totalRestricted.isZero()) {
      return RestrictionOrderStatus.FREE;
    }

    const materialRequest = await tx.materialRequest.findUnique({
      where: { id: targetMaterialRequestId },
      include: { items: true }
    });

    if (!materialRequest) {
      throw new BadRequestException(
        `A requisição de material ID ${targetMaterialRequestId}, necessária para o cálculo de status, não foi encontrada.`
      );
    }

    const totalRequested = materialRequest.items.reduce(
      (sum, item) => sum.add(item.quantityRequested),
      new Decimal(0)
    );

    if (totalRestricted.gte(totalRequested)) {
      return RestrictionOrderStatus.FULLY_RESTRICTED;
    }

    return RestrictionOrderStatus.PARTIALLY_RESTRICTED;
  }

  async create(
    data: CreateMaterialRestrictionOrderWithRelationsDto
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    const {
      warehouse,
      processedByUser,
      targetMaterialRequest,
      status,
      ...restOfData
    } = data;
    let { items } = data;

    if (!targetMaterialRequest?.id) {
      throw new BadRequestException(
        'targetMaterialRequest.id é obrigatório para criar uma ordem de restrição.'
      );
    }

    try {
      const createdOrder = await this.prisma.$transaction(async (tx) => {
        let finalStatus = status;

        if (status === RestrictionOrderStatus.FULLY_RESTRICTED) {
          const request = await tx.materialRequest.findUnique({
            where: { id: targetMaterialRequest.id },
            include: { items: true }
          });
          if (!request || request.items.length === 0) {
            throw new BadRequestException(
              `Requisição de material ID ${targetMaterialRequest.id} não encontrada ou vazia para restrição total.`
            );
          }
          items = request.items.map(
            (reqItem) =>
              ({
                quantityRestricted: reqItem.quantityRequested,
                globalMaterialId: reqItem.requestedGlobalMaterialId,
                materialInstanceId: reqItem.fulfilledByInstanceId,
                targetMaterialRequestItemId: reqItem.id
              }) as any
          );
        } else if (!status) {
          finalStatus = await this._calculateRestrictionStatus(
            tx as PrismaTransactionClient,
            targetMaterialRequest.id,
            items ?? []
          );
        }

        const createInput: Prisma.MaterialRestrictionOrderCreateInput = {
          ...restOfData,
          status: finalStatus,
          warehouse: { connect: { id: warehouse.id } },
          processedByUser: { connect: { id: processedByUser.id } },
          targetMaterialRequest: { connect: { id: targetMaterialRequest.id } },
          items: items
            ? {
                create: items.map((item) => ({
                  quantityRestricted: item.quantityRestricted,
                  globalMaterial: { connect: { id: item.globalMaterialId } },
                  materialInstance: item.materialInstanceId
                    ? { connect: { id: item.materialInstanceId } }
                    : undefined,
                  targetMaterialRequestItem: {
                    connect: { id: item.targetMaterialRequestItemId }
                  }
                }))
              }
            : undefined
        };

        const newOrder = await tx.materialRestrictionOrder.create({
          data: createInput,
          include: { items: true }
        });

        for (const item of newOrder.items) {
          await this._createStockMovement(tx as PrismaTransactionClient, {
            item,
            quantityChange: item.quantityRestricted,
            order: {
              warehouseId: warehouse.id,
              processedByUserId: processedByUser.id
            }
          });
        }

        return tx.materialRestrictionOrder.findUniqueOrThrow({
          where: { id: newOrder.id },
          include: this.includeRelations
        });
      });
      return createdOrder;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialRestrictionOrdersService',
        {
          operation: 'create',
          data
        }
      );
      throw error;
    }
  }

  async update(
    id: number,
    data: UpdateMaterialRestrictionOrderWithRelationsDto
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    const { status, items: itemsToUpdate, ...restOfData } = data;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const currentOrder = await tx.materialRestrictionOrder.findUnique({
          where: { id },
          include: { items: true, targetMaterialRequest: true }
        });

        if (!currentOrder) {
          throw new NotFoundException(
            `Ordem de restrição ID ${id} não encontrada.`
          );
        }

        const targetRequestId =
          data.targetMaterialRequest?.id ??
          currentOrder.targetMaterialRequestId;
        if (!targetRequestId) {
          throw new BadRequestException(
            'Não é possível atualizar sem uma requisição de material alvo.'
          );
        }

        const orderInfoForMovement = {
          warehouseId: data.warehouse?.id ?? currentOrder.warehouseId,
          processedByUserId:
            data.processedByUser?.id ?? currentOrder.processedByUserId,
          targetMaterialRequest: currentOrder.targetMaterialRequest
        };

        let finalStatus = status;
        let itemsPayload: Prisma.MaterialRestrictionOrderItemUpdateManyWithoutMaterialRestrictionOrderNestedInput =
          {};

        // #3: Se o status for FREE, zera todos os itens e libera o estoque
        if (status === RestrictionOrderStatus.FREE) {
          for (const item of currentOrder.items) {
            await this._createStockMovement(tx as PrismaTransactionClient, {
              item,
              quantityChange: item.quantityRestricted.negated(), // Libera o estoque
              order: orderInfoForMovement
            });
          }
          itemsPayload = {
            updateMany: {
              where: { materialRestrictionOrderId: id },
              data: { quantityRestricted: 0 }
            }
          };
        }
        // #2: Se o status for FULLY_RESTRICTED, reconcilia todos os itens
        else if (status === RestrictionOrderStatus.FULLY_RESTRICTED) {
          const request = await tx.materialRequest.findUnique({
            where: { id: targetRequestId },
            include: { items: true }
          });
          if (!request)
            throw new BadRequestException(
              `Requisição de material ID ${targetRequestId} não encontrada para reconciliação.`
            );

          const currentItemsMap = new Map(
            currentOrder.items.map((item) => [
              item.targetMaterialRequestItemId,
              item
            ])
          );
          const requestItemsMap = new Map(
            request.items.map((item) => [item.id, item])
          );

          const createOps: Prisma.MaterialRestrictionOrderItemCreateWithoutMaterialRestrictionOrderInput[] =
            [];
          const updateOps: {
            where: { id: number };
            data: { quantityRestricted: Decimal };
          }[] = [];
          const deleteOps: { id: number }[] = [];

          // Verifica o que criar ou atualizar
          for (const [reqItemId, reqItem] of requestItemsMap.entries()) {
            const currentItem = currentItemsMap.get(reqItemId);
            if (currentItem) {
              // Item existe, precisa atualizar
              const diff = reqItem.quantityRequested.sub(
                currentItem.quantityRestricted
              );
              await this._createStockMovement(tx as PrismaTransactionClient, {
                item: currentItem,
                quantityChange: diff,
                order: orderInfoForMovement
              });
              updateOps.push({
                where: { id: currentItem.id },
                data: { quantityRestricted: reqItem.quantityRequested }
              });
              currentItemsMap.delete(reqItemId); // Marca como processado
            } else {
              // Item não existe, precisa criar
              const newRestrictionItemData = {
                quantityRestricted: reqItem.quantityRequested,
                globalMaterial: {
                  connect: { id: reqItem.requestedGlobalMaterialId }
                },
                materialInstance: reqItem.fulfilledByInstanceId
                  ? { connect: { id: reqItem.fulfilledByInstanceId } }
                  : undefined,
                targetMaterialRequestItem: { connect: { id: reqItem.id } }
              };
              createOps.push(newRestrictionItemData);
              // O movimento de estoque será criado após a criação do item
            }
          }
          // O que sobrou no currentItemsMap precisa ser deletado
          for (const itemToDelete of currentItemsMap.values()) {
            await this._createStockMovement(tx as PrismaTransactionClient, {
              item: itemToDelete,
              quantityChange: itemToDelete.quantityRestricted.negated(),
              order: orderInfoForMovement
            });
            deleteOps.push({ id: itemToDelete.id });
          }

          itemsPayload = {
            create: createOps,
            update: updateOps,
            delete: deleteOps
          };
        }
        // #4: Atualização manual de itens, sem um status explícito
        else if (itemsToUpdate && !status) {
          const currentItemsMap = new Map(
            currentOrder.items.map((item) => [item.id, item])
          );
          const updateOps: {
            where: { id: number };
            data: { quantityRestricted: Decimal };
          }[] = [];

          for (const itemUpdate of itemsToUpdate) {
            const currentItem = currentItemsMap.get(itemUpdate.id);
            if (!currentItem)
              throw new NotFoundException(
                `Item de restrição ID ${itemUpdate.id} não encontrado na ordem.`
              );

            const newQuantity = new Decimal(itemUpdate.quantityRestricted);
            const diff = newQuantity.sub(currentItem.quantityRestricted);
            await this._createStockMovement(tx as PrismaTransactionClient, {
              item: currentItem,
              quantityChange: diff,
              order: orderInfoForMovement
            });
            updateOps.push({
              where: { id: currentItem.id },
              data: { quantityRestricted: newQuantity }
            });
          }
          itemsPayload = { update: updateOps };

          // Recalcula o status após as atualizações
          const finalItemsState = currentOrder.items.map((item) => {
            const updatedItem = itemsToUpdate.find((u) => u.id === item.id);
            return updatedItem
              ? {
                  ...item,
                  quantityRestricted: new Decimal(
                    updatedItem.quantityRestricted
                  )
                }
              : item;
          });
          finalStatus = await this._calculateRestrictionStatus(
            tx as PrismaTransactionClient,
            targetRequestId,
            finalItemsState
          );
        }

        const updatePayload: Prisma.MaterialRestrictionOrderUpdateInput = {
          ...restOfData,
          targetMaterialRequest: data.targetMaterialRequest?.id
            ? { connect: { id: data.targetMaterialRequest.id } }
            : undefined,
          status: finalStatus,
          items: itemsPayload,
          warehouse: data.warehouse?.id
            ? { connect: { id: data.warehouse.id } }
            : undefined,
          processedByUser: data.processedByUser?.id
            ? { connect: { id: data.processedByUser.id } }
            : undefined
        };

        const updatedOrder = await tx.materialRestrictionOrder.update({
          where: { id },
          data: updatePayload
        });

        // Se houve criação, precisamos gerar os movimentos para os novos itens
        if (
          itemsPayload.create &&
          Array.isArray(itemsPayload.create) &&
          itemsPayload.create.length > 0
        ) {
          const newItems = await tx.materialRestrictionOrderItem.findMany({
            where: {
              materialRestrictionOrderId: updatedOrder.id,
              id: { notIn: currentOrder.items.map((i) => i.id) }
            }
          });
          for (const newItem of newItems) {
            await this._createStockMovement(tx as PrismaTransactionClient, {
              item: newItem,
              quantityChange: newItem.quantityRestricted,
              order: orderInfoForMovement
            });
          }
        }

        return tx.materialRestrictionOrder.findUniqueOrThrow({
          where: { id },
          include: this.includeRelations
        });
      });
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialRestrictionOrdersService',
        {
          operation: 'update',
          id,
          data
        }
      );
      throw error;
    }
  }

  async delete(id: number): Promise<{ message: string; id: number }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const orderToDelete = await tx.materialRestrictionOrder.findUnique({
          where: { id },
          include: { items: true }
        });

        if (!orderToDelete) {
          this.logger.warn(
            `Ordem de restrição ${id} não encontrada para exclusão (pode já ter sido deletada).`
          );
          return;
        }

        const orderInfo = {
          warehouseId: orderToDelete.warehouseId,
          processedByUserId: orderToDelete.processedByUserId
        };

        for (const item of orderToDelete.items) {
          await this._createStockMovement(tx as PrismaTransactionClient, {
            item,
            quantityChange: item.quantityRestricted.negated(),
            order: orderInfo
          });
        }
        await tx.materialRestrictionOrder.delete({ where: { id } });
      });

      return {
        message:
          'Material Restriction Order deleted and all associated stock released successfully',
        id: id
      };
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialRestrictionOrdersService',
        {
          operation: 'delete',
          id
        }
      );
      throw error;
    }
  }

  // Os métodos list() e show() permanecem os mesmos, pois já estavam bons.

  async list(): Promise<MaterialRestrictionOrderWithRelationsResponseDto[]> {
    try {
      return this.prisma.materialRestrictionOrder.findMany({
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialRestrictionOrdersService',
        {
          operation: 'list'
        }
      );
      throw error;
    }
  }

  async show(
    id: number
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    try {
      const materialRestrictionOrder =
        await this.prisma.materialRestrictionOrder.findUnique({
          where: { id },
          include: this.includeRelations
        });
      if (!materialRestrictionOrder) {
        throw new NotFoundException(
          `Material Restriction Order with ID ${id} not found`
        );
      }
      return materialRestrictionOrder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(
        error,
        this.logger,
        'MaterialRestrictionOrdersService',
        {
          operation: 'show',
          id
        }
      );
      throw error;
    }
  }
}
