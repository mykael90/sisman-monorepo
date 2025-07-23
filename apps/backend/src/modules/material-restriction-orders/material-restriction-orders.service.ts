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

// Helper type para o cliente de transação do Prisma, evitando 'as any'
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
    targetMaterialRequest: true,
    items: {
      include: {
        globalMaterial: true,
        materialInstance: true
      }
    }
  };

  /**
   * #1: LÓGICA DE CÁLCULO DE STATUS
   * Calcula o status da ordem de restrição baseado na soma das quantidades.
   */
  private _calculateRestrictionStatus(
    items: {
      quantityRequested: Decimal;
      quantityRestricted: Decimal;
    }[]
  ): RestrictionOrderStatus {
    const totalRequested = items.reduce(
      (sum, item) => sum.add(item.quantityRequested),
      new Decimal(0)
    );
    const totalRestricted = items.reduce(
      (sum, item) => sum.add(item.quantityRestricted),
      new Decimal(0)
    );

    if (totalRestricted.isZero()) {
      return RestrictionOrderStatus.FREE;
    }
    // Usamos gte (greater than or equal) para cobrir casos de excesso de restrição
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
      items,
      ...restOfData
    } = data;

    // Calcula o status inicial com base nos itens fornecidos
    const initialStatus = this._calculateRestrictionStatus(items);

    const restrictionOrderCreateInput: Prisma.MaterialRestrictionOrderCreateInput =
      {
        ...restOfData,
        status: initialStatus, // Salva o status calculado
        warehouse: { connect: { id: warehouse.id } },
        processedByUser: { connect: { id: processedByUser.id } },
        targetMaterialRequest: targetMaterialRequest?.id
          ? { connect: { id: targetMaterialRequest.id } }
          : undefined,
        items: {
          create: items.map((item) => ({
            globalMaterial: item.globalMaterialId
              ? { connect: { id: item.globalMaterialId } }
              : undefined,
            materialInstance: item.materialInstanceId
              ? { connect: { id: item.materialInstanceId } }
              : undefined,
            quantityRequested: item.quantityRequested,
            quantityRestricted: item.quantityRestricted,
            targetMaterialRequestItem: item.targetMaterialRequestItemId
              ? { connect: { id: item.targetMaterialRequestItemId } }
              : undefined
          }))
        }
      };

    try {
      this.logger.log(
        `Iniciando transação para criar ordem de restrição de material...`
      );
      const createdRestrictionOrder = await this.prisma.$transaction(
        async (tx) => {
          // ETAPA 0: VERIFICAÇÃO DE UNICIDADE
          if (targetMaterialRequest?.id) {
            const existingOrder = await tx.materialRestrictionOrder.findUnique({
              where: { targetMaterialRequestId: targetMaterialRequest.id }
            });
            if (existingOrder) {
              throw new ConflictException(
                `A requisição de material com ID ${targetMaterialRequest.id} já está associada à ordem de restrição nº ${existingOrder.restrictionOrderNumber}.`
              );
            }
          }

          // ETAPA 1: Criar a Ordem de Restrição e seus Itens.
          const newRestrictionOrder = await tx.materialRestrictionOrder.create({
            data: restrictionOrderCreateInput,
            include: { items: true, targetMaterialRequest: true }
          });

          this.logger.log(
            `Ordem de restrição nº ${newRestrictionOrder.restrictionOrderNumber} criada.`
          );

          // ETAPA 2: Iterar sobre os itens criados para gerar as movimentações de estoque.
          for (const createdItem of newRestrictionOrder.items) {
            if (createdItem.quantityRestricted.greaterThan(0)) {
              const materialStockMovement: CreateMaterialStockMovementWithRelationsDto =
                {
                  quantity: createdItem.quantityRestricted,
                  globalMaterial: createdItem.globalMaterialId
                    ? ({ id: createdItem.globalMaterialId } as any)
                    : undefined,
                  materialInstance: createdItem.materialInstanceId
                    ? ({ id: createdItem.materialInstanceId } as any)
                    : undefined,
                  warehouse: { id: warehouse.id } as any,
                  movementType: {
                    code: MaterialStockOperationSubType.RESTRICT_FOR_PAID_ITEM
                  } as any,
                  processedByUser: { id: processedByUser.id } as any,
                  materialRestrictionItem: { id: createdItem.id } as any,
                  materialRequestItem: createdItem.targetMaterialRequestItemId
                    ? ({ id: createdItem.targetMaterialRequestItemId } as any)
                    : undefined,
                  maintenanceRequest: newRestrictionOrder.targetMaterialRequest
                    ?.maintenanceRequestId
                    ? ({
                        id: newRestrictionOrder.targetMaterialRequest
                          .maintenanceRequestId
                      } as any)
                    : undefined
                };

              // Chama o serviço de movimentação, passando o cliente da transação (tx)
              await this.materialStockMovementsService.create(
                materialStockMovement,
                tx as any
              );
            }
          }
          this.logger.log(`Movimentações de estoque criadas com sucesso.`);

          // ETAPA 3: Retornar a ordem de restrição completa.
          return tx.materialRestrictionOrder.findUniqueOrThrow({
            where: { id: newRestrictionOrder.id },
            include: this.includeRelations
          });
        }
      );

      this.logger.log(`Transação concluída com sucesso!`);
      return createdRestrictionOrder;
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

  /**
   * #2: LÓGICA DE ATUALIZAÇÃO E MOVIMENTAÇÃO DE ESTOQUE
   * Manipula as atualizações nos itens e cria os movimentos de estoque correspondentes.
   */
  private async _handleItemUpdatesAndStockMovements(
    tx: PrismaTransactionClient,
    orderData: {
      id: number;
      warehouseId: number;
      processedByUserId: number;
      maintenanceRequestId?: number;
    },
    currentItems: MaterialRestrictionOrderItem[],
    itemsToUpdate: UpdateMaterialRestrictionOrderItemDto[]
  ) {
    for (const itemUpdate of itemsToUpdate) {
      if (!itemUpdate.id) {
        // Lógica para criar um novo item (se aplicável)
        this.logger.warn(`Criação de item na atualização não implementada.`);
        continue;
      }

      const currentItem = currentItems.find((i) => i.id === itemUpdate.id);
      if (!currentItem) {
        throw new NotFoundException(
          `Item de restrição com ID ${itemUpdate.id} não encontrado na ordem.`
        );
      }

      const oldQty = currentItem.quantityRestricted;
      const newQty = new Decimal(itemUpdate.quantityRestricted);
      const diff = newQty.sub(oldQty);

      if (diff.isZero()) continue; // Nenhuma mudança na quantidade, pular.

      const movementType = diff.isPositive()
        ? MaterialStockOperationSubType.RESTRICT_FOR_PAID_ITEM
        : MaterialStockOperationSubType.RELEASE_PAID_RESTRICTION;

      const movementPayload: CreateMaterialStockMovementWithRelationsDto = {
        quantity: diff.abs(), // A quantidade é sempre positiva
        globalMaterial: currentItem.globalMaterialId
          ? ({ id: currentItem.globalMaterialId } as any)
          : undefined,
        materialInstance: currentItem.materialInstanceId
          ? ({ id: currentItem.materialInstanceId } as any)
          : undefined,
        warehouse: { id: orderData.warehouseId } as any,
        processedByUser: { id: orderData.processedByUserId } as any,
        movementType: { code: movementType } as any,
        materialRestrictionItem: { id: currentItem.id } as any,
        materialRequestItem: currentItem.targetMaterialRequestItemId
          ? ({ id: currentItem.targetMaterialRequestItemId } as any)
          : undefined,
        maintenanceRequest: orderData.maintenanceRequestId
          ? ({ id: orderData.maintenanceRequestId } as any)
          : undefined
      };

      await this.materialStockMovementsService.create(
        movementPayload,
        tx as any
      );
      this.logger.log(
        `Movimento de estoque [${movementType}] de ${diff.abs()} para o item ${currentItem.id} criado.`
      );
    }
    // TODO: Implementar lógica para deletar itens que estão no `currentItems` mas não no `itemsToUpdate`
  }

  async update(
    id: number,
    data: UpdateMaterialRestrictionOrderWithRelationsDto
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    const {
      warehouse,
      processedByUser,
      targetMaterialRequest,
      items: itemsToUpdate, // Novos dados dos itens
      ...restOfData
    } = data;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Buscar o estado atual da ordem e seus itens
        const currentOrder = await tx.materialRestrictionOrder.findUnique({
          where: { id },
          include: { items: true, targetMaterialRequest: true }
        });

        if (!currentOrder) {
          throw new NotFoundException(
            `Ordem de restrição com ID ${id} não encontrada.`
          );
        }

        // 2. Lidar com atualizações de itens e criar movimentos de estoque
        if (itemsToUpdate && itemsToUpdate.length > 0) {
          // Garante que temos as informações necessárias para criar os movimentos.
          const warehouseId = warehouse?.id ?? currentOrder.warehouseId;
          const processedByUserId =
            processedByUser?.id ?? currentOrder.processedByUserId;
          if (!warehouseId || !processedByUserId) {
            throw new BadRequestException(
              'Warehouse e ProcessedByUser são necessários para atualizar itens.'
            );
          }

          await this._handleItemUpdatesAndStockMovements(
            tx as PrismaTransactionClient,
            {
              id: currentOrder.id,
              warehouseId,
              processedByUserId,
              maintenanceRequestId:
                currentOrder.targetMaterialRequest?.maintenanceRequestId
            },
            currentOrder.items,
            itemsToUpdate
          );
        }

        // 3. Preparar o payload de atualização para a ordem principal
        const updatePayload: Prisma.MaterialRestrictionOrderUpdateInput = {
          ...restOfData,
          warehouse: warehouse?.id
            ? { connect: { id: warehouse.id } }
            : undefined,
          processedByUser: processedByUser?.id
            ? { connect: { id: processedByUser.id } }
            : undefined,
          targetMaterialRequest: targetMaterialRequest?.id
            ? { connect: { id: targetMaterialRequest.id } }
            : undefined,
          // Atualiza os dados dos itens aninhados
          items: itemsToUpdate
            ? {
                update: itemsToUpdate
                  .filter((item) => item.id) // Apenas itens com ID podem ser atualizados
                  .map((item) => ({
                    where: { id: item.id },
                    data: {
                      quantityRestricted: item.quantityRestricted
                      // Adicione outros campos do item que podem ser atualizados
                    }
                  }))
              }
            : undefined
        };

        // 4. Recalcular o status após as atualizações dos itens
        if (itemsToUpdate) {
          // Para recalcular, precisamos do estado final dos itens
          const updatedItems = currentOrder.items.map((item) => {
            const updateInfo = itemsToUpdate.find((u) => u.id === item.id);
            return updateInfo
              ? {
                  ...item,
                  quantityRestricted: new Decimal(updateInfo.quantityRestricted)
                }
              : item;
          });
          updatePayload.status = this._calculateRestrictionStatus(updatedItems);
        }

        // 5. Executar a atualização da ordem e seus itens
        await tx.materialRestrictionOrder.update({
          where: { id },
          data: updatePayload
        });

        // 6. Retornar a ordem completa com todas as relações atualizadas
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

  /**
   * #3: MELHORIA - EXCLUSÃO SEGURA
   * Garante que o estoque restringido seja liberado antes de excluir a ordem.
   */
  async delete(id: number): Promise<{ message: string; id: number }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const orderToDelete = await tx.materialRestrictionOrder.findUnique({
          where: { id },
          include: { items: true, targetMaterialRequest: true }
        });

        if (!orderToDelete) {
          // Se não encontrar, a operação já foi concluída, então não lançamos erro.
          this.logger.warn(
            `Ordem de restrição ${id} não encontrada para exclusão.`
          );
          return;
        }

        // Liberar estoque para cada item que tem quantidade restringida
        for (const item of orderToDelete.items) {
          if (item.quantityRestricted.greaterThan(0)) {
            const movementPayload: CreateMaterialStockMovementWithRelationsDto =
              {
                quantity: item.quantityRestricted,
                globalMaterial: item.globalMaterialId
                  ? ({ id: item.globalMaterialId } as any)
                  : undefined,
                materialInstance: item.materialInstanceId
                  ? ({ id: item.materialInstanceId } as any)
                  : undefined,
                warehouse: { id: orderToDelete.warehouseId } as any,
                processedByUser: { id: orderToDelete.processedByUserId } as any, // Poderia ser um usuário de sistema
                movementType: {
                  code: MaterialStockOperationSubType.RELEASE_PAID_RESTRICTION
                } as any,
                materialRestrictionItem: { id: item.id } as any,
                maintenanceRequest: orderToDelete.targetMaterialRequest
                  ?.maintenanceRequestId
                  ? ({
                      id: orderToDelete.targetMaterialRequest
                        .maintenanceRequestId
                    } as any)
                  : undefined
              };
            await this.materialStockMovementsService.create(
              movementPayload,
              tx as any
            );
            this.logger.log(
              `Estoque liberado para o item ${item.id} antes da exclusão da ordem ${id}.`
            );
          }
        }

        // Finalmente, deletar a ordem de restrição (o Prisma cuidará da exclusão em cascata dos itens)
        await tx.materialRestrictionOrder.delete({ where: { id } });
      });

      return {
        message:
          'Material Restriction Order and associated stock released/deleted successfully',
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
