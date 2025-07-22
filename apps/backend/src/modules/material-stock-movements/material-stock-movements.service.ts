import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialStockMovementWithRelationsDto,
  UpdateMaterialStockMovementWithRelationsDto,
  MaterialStockMovementWithRelationsResponseDto
} from './dto/material-stock-movements.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  Prisma,
  MaterialStockOperationType,
  MaterialStockOperationSubType,
  MaterialWarehouseStock
} from '@sisman/prisma';

// Definindo o tipo do cliente Prisma para clareza
type PrismaClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class MaterialStockMovementsService {
  private readonly logger = new Logger(MaterialStockMovementsService.name);
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations: Prisma.MaterialStockMovementInclude = {
    warehouse: true,
    globalMaterial: true,
    materialInstance: true,
    movementType: true,
    processedByUser: true,
    collectedByUser: true,
    collectedByWorker: true,
    warehouseMaterialStock: true,
    materialRequestItem: true,
    maintenanceRequest: true,
    materialWithdrawalItem: true,
    materialReceiptItem: true,
    stockTransferOrderItem: true
  };

  /**
   * Garante que um registro de estoque exista para um material em um almoxarifado.
   * Não altera o saldo, apenas cria o registro com valores padrão se ele não existir.
   * @returns O registro de MaterialWarehouseStock existente ou recém-criado.
   */
  private async ensureStockRecordExists(
    warehouseId: number,
    materialId: string,
    prisma: PrismaClient // Usamos o tipo genérico aqui
  ): Promise<MaterialWarehouseStock> {
    this.logger.log(
      `Garantindo a existência do registro de estoque para material ${materialId} no almoxarifado ${warehouseId}.`
    );

    return prisma.materialWarehouseStock.upsert({
      where: {
        unique_warehouse_material_standard_stock: { warehouseId, materialId }
      },
      // Nenhuma atualização de saldo é feita aqui.
      update: {},
      // Cria com saldo zero, pois a movimentação ainda não foi aplicada.
      create: {
        warehouseId,
        materialId,
        physicalOnHandQuantity: 0
      }
    });
  }

  /**
   * Aplica o efeito de uma movimentação de estoque ao saldo do registro correspondente.
   */
  private async applyStockMovementEffect(
    movement: Prisma.MaterialStockMovementGetPayload<{
      include: {
        movementType: true;
        materialRequestItem: true;
        warehouseMaterialStock: true;
      };
    }>,
    tx: PrismaClient
  ) {
    const {
      quantity,
      warehouseMaterialStockId,
      globalMaterialId: materialId,
      materialRequestItem,
      warehouseMaterialStock
    } = movement;
    const { operation, code } = movement.movementType;
    const movementQuantity = quantity.toNumber();

    if (!warehouseMaterialStockId) {
      throw new Error(
        'Movimentação de estoque não possui um ID de estoque associado para aplicar o efeito.'
      );
    }

    this.logger.log(
      `Aplicando efeito da movimentação ${movement.id} ao estoque ${warehouseMaterialStockId}.`
    );

    const updatePayload: Prisma.MaterialWarehouseStockUpdateInput = {};

    //TODO: Revisar lógica de cálculo de saldo dos itens
    switch (operation) {
      case MaterialStockOperationType.IN:
        this.logger.debug(`Operação de entrada. ${movementQuantity} e ${code}`);
        if (code === MaterialStockOperationSubType.INITIAL_STOCK_LOAD) {
          //TODO: Lógica para calcular o valor inicial de estoque
          const initialQuantity =
            movementQuantity -
            (warehouseMaterialStock.physicalOnHandQuantity.toNumber() ?? 0);
          if (initialQuantity > 0) {
            updatePayload.initialStockQuantity = initialQuantity;
          } else {
            //TODO. Pensar como fazer. A quantidade inicial não pode ser menor que 0. Acho que ele deve inserir um estravio primeiro.
            throw new BadRequestException(
              `A quantidade inicial calculada não pode ser negativa. Primeiramente, registre um estravio do material com id ${materialId} referente a ${-initialQuantity} unidades.`
            );
          }
        } else {
          updatePayload.physicalOnHandQuantity = {
            increment: movementQuantity
          };
        }
        // Atualizar o custo na entrada, se a informação estiver disponível
        if (materialId && materialRequestItem?.unitPrice !== null) {
          updatePayload.updatedCost = materialRequestItem.unitPrice;
        }
        break;
      case MaterialStockOperationType.OUT:
        updatePayload.physicalOnHandQuantity = { decrement: movementQuantity };
        break;
      case MaterialStockOperationType.ADJUSTMENT:
        // Para ajuste, a quantidade da movimentação é o valor a ser somado (pode ser negativo)
        // TODO:
        if (
          code === MaterialStockOperationSubType.ADJUSTMENT_INV_IN ||
          code === MaterialStockOperationSubType.ADJUSTMENT_RECLASSIFY_IN
        ) {
          updatePayload.physicalOnHandQuantity = {
            increment: movementQuantity
          };
        } else {
          updatePayload.physicalOnHandQuantity = {
            increment: -movementQuantity
          };
        }
        updatePayload.lastStockCountDate = new Date();
        break;
      case MaterialStockOperationType.RESERVATION:
        // TODO:
        updatePayload.reservedQuantity = { increment: movementQuantity };
        break;
      case MaterialStockOperationType.RESTRICTION:
        // TODO:
        updatePayload.restrictedQuantity = { increment: movementQuantity };
        break;
      default:
        this.logger.warn(
          `Operação '${operation}' não tem efeito no saldo de estoque.`
        );
        return; // Nenhuma ação necessária
    }

    await tx.materialWarehouseStock.update({
      where: { id: warehouseMaterialStockId },
      data: updatePayload
    });
  }

  /**
   * Método público para criar uma movimentação de estoque.
   * Gerencia a transação: inicia uma nova ou utiliza uma existente.
   */
  async create(
    data: CreateMaterialStockMovementWithRelationsDto,
    // O tx opcional já estava correto na sua assinatura
    tx?: Prisma.TransactionClient
  ): Promise<MaterialStockMovementWithRelationsResponseDto> {
    try {
      // Se um 'tx' (cliente de transação) for fornecido, use-o diretamente.
      if (tx) {
        this.logger.log(
          `Executando a criação dentro de uma transação existente.`
        );
        // Passamos o 'tx' para o método que contém a lógica de negócio.
        return await this._createMovementLogic(data, tx);
      }

      // Se nenhum 'tx' for fornecido, crie uma nova transação.
      this.logger.log(
        `Iniciando uma nova transação para criar a movimentação.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        // Passamos o cliente da nova transação para o método de lógica.
        return await this._createMovementLogic(
          data,
          prismaTransactionClient as any
        );
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialStockMovementsService', {
        operation: 'create',
        data
      });
      throw error; // Re-lança o erro para ser tratado pela camada superior.
    }
  }

  /**
   * Método privado que contém a lógica de negócio principal para criar a movimentação.
   * Ele é agnóstico à transação, apenas recebe um cliente Prisma para operar.
   * @param data Os dados para a criação.
   * @param prisma O cliente Prisma a ser usado (pode ser o principal ou um de transação).
   */
  private async _createMovementLogic(
    data: CreateMaterialStockMovementWithRelationsDto,
    prisma: PrismaClient // Usamos o tipo genérico aqui
  ): Promise<MaterialStockMovementWithRelationsResponseDto> {
    const {
      warehouse,
      globalMaterial,
      movementType,
      processedByUser,
      collectedByUser,
      collectedByWorker,
      materialInstance,
      materialRequestItem,
      maintenanceRequest,
      materialWithdrawalItem,
      materialReceiptItem,
      stockTransferOrderItem,
      ...restOfData
    } = data;

    if (!warehouse?.id || !globalMaterial?.id) {
      throw new BadRequestException(
        'Warehouse ID and Global Material ID are required.'
      );
    }

    // PASSO 1: Garantir que o "contêiner" do estoque exista.
    const stockRecord = await this.ensureStockRecordExists(
      warehouse.id,
      globalMaterial.id,
      prisma // Usar o cliente Prisma recebido
    );

    // PASSO 2: Registrar o evento da movimentação.
    this.logger.log(`Registrando o evento de movimentação...`);
    const movementCreateInput: Prisma.MaterialStockMovementCreateInput = {
      ...restOfData,
      warehouse: { connect: { id: warehouse.id } },
      globalMaterial: { connect: { id: globalMaterial.id } },
      warehouseMaterialStock: { connect: { id: stockRecord.id } },
      movementType: movementType?.code
        ? { connect: { code: movementType.code } }
        : undefined,
      processedByUser: processedByUser?.id
        ? { connect: { id: processedByUser.id } }
        : undefined,
      collectedByUser: collectedByUser?.id
        ? { connect: { id: collectedByUser.id } }
        : undefined,
      collectedByWorker: collectedByWorker?.id
        ? { connect: { id: collectedByWorker.id } }
        : undefined,
      materialInstance: materialInstance?.id
        ? { connect: { id: materialInstance.id } }
        : undefined,
      materialRequestItem: materialRequestItem?.id
        ? { connect: { id: materialRequestItem.id } }
        : undefined,
      maintenanceRequest: maintenanceRequest?.id
        ? { connect: { id: maintenanceRequest.id } }
        : undefined,
      materialWithdrawalItem: materialWithdrawalItem?.id
        ? { connect: { id: materialWithdrawalItem.id } }
        : undefined,
      materialReceiptItem: materialReceiptItem?.id
        ? { connect: { id: materialReceiptItem.id } }
        : undefined,
      stockTransferOrderItem: stockTransferOrderItem?.id
        ? { connect: { id: stockTransferOrderItem.id } }
        : undefined
    };

    const newMovement = await prisma.materialStockMovement.create({
      data: movementCreateInput,
      include: {
        movementType: true,
        materialRequestItem: true,
        warehouseMaterialStock: true
      }
    });

    // PASSO 3: Aplicar o efeito da movimentação ao saldo do estoque.
    await this.applyStockMovementEffect(newMovement, prisma); // Usar o cliente Prisma recebido

    // PASSO 4: Buscar o registro completo para o retorno.
    this.logger.log(
      `Buscando o registro completo da movimentação para o retorno.`
    );
    return prisma.materialStockMovement.findUniqueOrThrow({
      where: { id: newMovement.id },
      include: this.includeRelations
    });
  }

  async update(
    id: number,
    data: UpdateMaterialStockMovementWithRelationsDto
  ): Promise<MaterialStockMovementWithRelationsResponseDto> {
    // A lógica de atualização de uma movimentação de estoque é complexa.
    // Alterar uma movimentação existente exigiria reverter seu efeito original
    // e aplicar o novo, o que pode ter implicações em cascata.
    // Por enquanto, o método de update original que lida com conexões é mantido,
    // mas deve ser usado com cautela, principalmente se 'quantity' ou 'movementType' forem alterados.
    const {
      warehouse,
      globalMaterial,
      materialInstance,
      movementType,
      processedByUser,
      collectedByUser,
      collectedByWorker,
      warehouseMaterialStock,
      materialRequestItem,
      maintenanceRequest,
      materialWithdrawalItem,
      materialReceiptItem,
      stockTransferOrderItem,
      ...restOfData
    } = data;

    const updateInput: Prisma.MaterialStockMovementUpdateInput = {
      ...restOfData
    };

    // Lógica para conectar/desconectar relações
    if (warehouse?.id)
      updateInput.warehouse = { connect: { id: warehouse.id } };
    if (globalMaterial?.id)
      updateInput.globalMaterial = { connect: { id: globalMaterial.id } };
    if (materialInstance?.id)
      updateInput.materialInstance = { connect: { id: materialInstance.id } };
    if (movementType?.code)
      updateInput.movementType = { connect: { code: movementType.code } };
    if (processedByUser?.id)
      updateInput.processedByUser = { connect: { id: processedByUser.id } };
    if (collectedByUser?.id)
      updateInput.collectedByUser = { connect: { id: collectedByUser.id } };
    if (collectedByWorker?.id)
      updateInput.collectedByWorker = { connect: { id: collectedByWorker.id } };
    if (warehouseMaterialStock?.id)
      updateInput.warehouseMaterialStock = {
        connect: { id: warehouseMaterialStock.id }
      };
    if (materialRequestItem?.id)
      updateInput.materialRequestItem = {
        connect: { id: materialRequestItem.id }
      };
    if (maintenanceRequest?.id)
      updateInput.maintenanceRequest = {
        connect: { id: maintenanceRequest.id }
      };
    if (materialWithdrawalItem?.id)
      updateInput.materialWithdrawalItem = {
        connect: { id: materialWithdrawalItem.id }
      };
    if (materialReceiptItem?.id)
      updateInput.materialReceiptItem = {
        connect: { id: materialReceiptItem.id }
      };
    if (stockTransferOrderItem?.id)
      updateInput.stockTransferOrderItem = {
        connect: { id: stockTransferOrderItem.id }
      };
    // Adicione a lógica de desconexão (se um campo for passado como null) se necessário.

    try {
      return this.prisma.materialStockMovement.update({
        where: { id },
        data: updateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialStockMovementsService', {
        operation: 'update',
        id,
        data: updateInput
      });
      throw error;
    }
  }

  async delete(id: number): Promise<{ message: string; id: number }> {
    // A lógica de exclusão também é complexa.
    // Excluir uma movimentação exigiria reverter seu efeito no saldo do estoque.
    // Isso deve ser feito dentro de uma transação.
    try {
      await this.prisma.$transaction(async (prisma) => {
        const movementToDelete =
          await prisma.materialStockMovement.findUniqueOrThrow({
            where: { id },
            include: {
              movementType: true,
              materialRequestItem: true,
              warehouseMaterialStock: true
            }
          });

        // Reverte o efeito da movimentação no estoque.
        const reverseMovement = {
          ...movementToDelete,
          quantity: -movementToDelete.quantity as any // Inverte a quantidade
        };

        await this.applyStockMovementEffect(reverseMovement, prisma as any);

        // Agora, exclui a movimentação.
        await prisma.materialStockMovement.delete({ where: { id } });
      });

      return {
        message:
          'Material Stock Movement deleted and stock reverted successfully',
        id: id
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialStockMovementsService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }

  async list(): Promise<MaterialStockMovementWithRelationsResponseDto[]> {
    try {
      return this.prisma.materialStockMovement.findMany({
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialStockMovementsService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(
    id: number
  ): Promise<MaterialStockMovementWithRelationsResponseDto> {
    try {
      const materialStockMovement =
        await this.prisma.materialStockMovement.findUnique({
          where: { id },
          include: this.includeRelations
        });
      if (!materialStockMovement) {
        throw new NotFoundException(
          `Material Stock Movement with ID ${id} not found`
        );
      }
      return materialStockMovement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaterialStockMovementsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }
}
