import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialPickingOrderWithRelationsDto,
  UpdateMaterialPickingOrderWithRelationsDto,
  MaterialPickingOrderWithRelationsResponseDto,
  UpdateMaterialPickingOrderItemDto
} from './dto/material-picking-order.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  MaterialStockOperationSubType,
  Prisma,
  MaterialPickingOrderItem,
  MaterialPickingOrderStatus,
  PrismaClient
} from '@sisman/prisma';
import { MaterialStockMovementsService } from '../material-stock-movements/material-stock-movements.service';
import { CreateMaterialStockMovementWithRelationsDto } from '../material-stock-movements/dto/material-stock-movements.dto';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';
import { MaterialRequestWithRelationsResponseDto } from '../material-requests/dto/material-request.dto';
import { MaintenanceRequestWithRelationsResponseDto } from '../../modules/maintenance-requests/dto/maintenance-request.dto'; // Assuming this DTO exists
import { main } from '../../shared/prisma/seeds/users.seed';
import { MaterialRequestsService } from '../material-requests/material-requests.service';
import { WarehousesService } from '../warehouses/warehouses.service';

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class MaterialPickingOrdersService {
  private readonly logger = new Logger(MaterialPickingOrdersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly materialStockMovementsService: MaterialStockMovementsService,
    private readonly materialRequestsService: MaterialRequestsService,
    private readonly warehousesService: WarehousesService
  ) {}

  private readonly includeRelations: Prisma.MaterialPickingOrderInclude = {
    warehouse: true,
    materialRequest: true,
    maintenanceRequest: true,
    requestedByUser: true,
    beCollectedByUser: true,
    beCollectedByWorker: true,
    items: true
  };

  /**
   * Utilitário para criar movimentos de estoque de forma consistente.
   */
  private async _createStockMovement(
    tx: PrismaTransactionClient,
    params: {
      item: {
        id: number;
        globalMaterialId?: string;
        materialInstanceId?: number;
        materialRequestItemId?: number;
        quantityToPick: Decimal;
      };
      quantityChange: Decimal;
      order: {
        warehouseId: number;
        processedByUserId: number;
        maintenanceRequestId?: number;
      };
      movementSubType: MaterialStockOperationSubType;
    }
  ) {
    if (params.quantityChange.isZero()) {
      this.logger.debug(
        `Item de separação ${params.item.id} com alteração de quantidade zero, pulando movimentação de estoque.`
      );
      return;
    }

    this.logger.log(
      `Criando movimentação de estoque do tipo '${params.movementSubType}' para o item de separação ${params.item.id} com quantidade ${params.quantityChange.abs()}.`
    );

    const movementPayload: CreateMaterialStockMovementWithRelationsDto = {
      quantity: params.quantityChange.abs(),
      globalMaterial: { id: params.item.globalMaterialId } as any,
      materialInstance: params.item.materialInstanceId
        ? ({ id: params.item.materialInstanceId } as any)
        : undefined,
      warehouse: { id: params.order.warehouseId } as any,
      processedByUser: { id: params.order.processedByUserId } as any,
      movementType: { code: params.movementSubType } as any,
      materialPickingOrderItem: { id: params.item.id } as any,
      materialRequestItem: params.item.materialRequestItemId
        ? ({ id: params.item.materialRequestItemId } as any)
        : undefined,
      maintenanceRequest: params.order.maintenanceRequestId
        ? ({
            id: params.order.maintenanceRequestId
          } as any)
        : undefined
    };

    await this.materialStockMovementsService.create(movementPayload, tx as any);
  }

  /**
   * Calcula o status da ordem de separação.
   * Para ordens de separação, o status é mais sobre o progresso da separação/retirada.
   * Por simplicidade inicial, focaremos em PENDING_PREPARATION, IN_PREPARATION, READY_FOR_PICKUP, CANCELLED.
   * PARTIALLY_WITHDRAWN e FULLY_WITHDRAWN serão atualizados por MaterialWithdrawal.
   */
  private async _calculatePickingOrderStatus(
    pickingItems: { quantityToPick: Decimal; quantityPicked?: Decimal }[]
  ): Promise<MaterialPickingOrderStatus> {
    this.logger.debug(`Calculando status da ordem de separação.`);
    const totalToPick = pickingItems.reduce(
      (sum, item) => sum.add(item.quantityToPick),
      new Decimal(0)
    );
    const totalPicked = pickingItems.reduce(
      (sum, item) => sum.add(item.quantityPicked || 0),
      new Decimal(0)
    );

    if (totalPicked.isZero()) {
      return MaterialPickingOrderStatus.PENDING_PREPARATION;
    }

    if (totalPicked.gte(totalToPick)) {
      return MaterialPickingOrderStatus.READY_FOR_PICKUP;
    }

    return MaterialPickingOrderStatus.IN_PREPARATION; // Or PARTIALLY_PREPARED if we want more granularity
  }

  /**
   * Valida se uma nova ordem de separação (reserva) pode ser criada ou atualizada.
   * Verifica contra o saldo potencial livre.
   */
  private async _canOrderPickingMaterialRequest(
    materialRequestId: number,
    itemsPickingOrder: Array<{
      quantityToPick: Prisma.Decimal;
      materialRequestItemId: number;
    }>,
    pickingOrderIdToExclude?: number
  ): Promise<void> {
    await this.materialRequestsService.validateOperationAgainstBalance(
      materialRequestId,
      // Mapeia do formato específico para o genérico
      itemsPickingOrder.map((item) => ({
        materialRequestItemId: item.materialRequestItemId,
        quantity: item.quantityToPick
      })),
      {
        type: 'RESERVATION',
        balanceToCheck: 'potential',
        idToExclude: { pickingOrderIdToExclude }
      }
    );
  }

  /**
   * Valida se uma reserva de estoque (ordem de separação) geral do almoxarifado pode ser realizada.
   *
   * @param tx O cliente Prisma da transação.
   * @param warehouseId O ID do almoxarifado.
   * @param itemsToPick Os itens a serem reservados.
   * @param pickingOrderIdToExclude O ID de uma reserva existente a ser ignorada (para cenários de atualização).
   */
  private async _canOrderPickingWarehouseStock(
    tx: PrismaClient,
    warehouseId: number,
    itemsToPick: Array<{
      quantityToPick: Prisma.Decimal;
      globalMaterialId: string;
    }>,
    pickingOrderIdToExclude?: number
  ): Promise<void> {
    // A lógica de exclusão para Picking Orders precisa ser adicionada ao método genérico.
    // Vamos primeiro adicioná-la em `_validateWarehouseOperation`.

    // O "wrapper" chama o método genérico com a configuração para 'RESERVATION'.
    await this.warehousesService.validateWarehouseOperation(
      tx,
      warehouseId,
      // Adapta o formato do array de entrada para o formato genérico
      itemsToPick.map((item) => ({
        globalMaterialId: item.globalMaterialId,
        quantity: item.quantityToPick
      })),
      // Configura a operação como uma 'RESERVATION'
      {
        type: 'RESERVATION',
        idToExclude: { pickingOrderId: pickingOrderIdToExclude }
      }
    );
  }

  /**
   * Método público para criar uma ordem de separação.
   * Gerencia a transação: inicia uma nova ou utiliza uma existente.
   */
  async create(
    data: CreateMaterialPickingOrderWithRelationsDto,
    tx?: Prisma.TransactionClient
  ): Promise<MaterialPickingOrderWithRelationsResponseDto> {
    try {
      if (tx) {
        this.logger.log(
          `Executando a criação dentro de uma transação existente.`
        );
        return await this._createPickingOrderLogic(data, tx as any);
      }

      this.logger.log(
        `Iniciando uma nova transação para criar a ordem de separação.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._createPickingOrderLogic(
          data,
          prismaTransactionClient as any
        );
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialPickingOrdersService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async _createPickingOrderLogic(
    data: CreateMaterialPickingOrderWithRelationsDto,
    prisma: PrismaClient
  ): Promise<MaterialPickingOrderWithRelationsResponseDto> {
    this.logger.log(`Iniciando processo de criação de ordem de separação...`);
    const { warehouse, requestedByUser, materialRequest, ...restOfData } = data;

    let { items } = data;
    let { maintenanceRequest } = data;

    let materialRequestDB: MaterialRequestWithRelationsResponseDto;

    if (!items || items.length === 0) {
      throw new BadRequestException(
        'É necessário fornecer itens ou vincular uma requisição de material para criar uma ordem de separação.'
      );
    }

    if (materialRequest) {
      if (!materialRequest.id) {
        throw new BadRequestException(
          'materialRequest.id é obrigatório se materialRequest for fornecido.'
        );
      }
      materialRequestDB = await prisma.materialRequest.findUnique({
        where: { id: materialRequest.id },
        include: { items: true }
      });

      await this._canOrderPickingMaterialRequest(materialRequest.id, items);

      if (maintenanceRequest) {
        if (!maintenanceRequest.id) {
          throw new BadRequestException(
            'maintenanceRequest.id é obrigatório se maintenanceRequest for fornecido.'
          );
        }
        // maintenanceRequestId = maintenanceRequest.id;
      }

      // If materialRequestDB.maintenanceRequestId is provided but maintenanceRequest is null
      if (materialRequestDB.maintenanceRequestId && !maintenanceRequest) {
        maintenanceRequest = {
          id: materialRequestDB.maintenanceRequestId
        } as any;
      }
    }

    // verificar de forma geral no deposito se tem saldo para os items que vão ser reservados.
    await this._canOrderPickingWarehouseStock(
      prisma as any,
      warehouse.id,
      items.map((item) => ({
        globalMaterialId: item.globalMaterialId,
        quantityToPick: item.quantityToPick
      }))
    );

    // If no items are provided, and no materialRequest is linked, it's a bad request.
    // If materialRequest is linked, items can be generated from it. Reserved all
    // if (!items || items.length === 0) {
    //   if (!materialRequest) {
    //     throw new BadRequestException(
    //       'É necessário fornecer itens ou vincular uma requisição de material para criar uma ordem de separação.'
    //     );
    //   }

    //   if (!materialRequestDB || materialRequestDB.items.length === 0) {
    //     throw new BadRequestException(
    //       `Requisição de material ID ${materialRequest.id} não encontrada ou não possui itens para gerar a ordem de separação.`
    //     );
    //   }

    //   items = materialRequestDB.items.map(
    //     (reqItem) =>
    //       ({
    //         globalMaterialId: reqItem.requestedGlobalMaterialId,
    //         materialInstanceId: reqItem.fulfilledByInstanceId,
    //         quantityToPick: reqItem.quantityRequested,
    //         materialRequestItemId: reqItem.id
    //       }) as any
    //   );
    // }

    const createInput: Prisma.MaterialPickingOrderCreateInput = {
      ...restOfData,
      warehouse: { connect: { id: warehouse.id } },
      requestedByUser: { connect: { id: requestedByUser.id } },
      materialRequest: materialRequest
        ? { connect: { id: materialRequest.id } }
        : undefined,
      maintenanceRequest: maintenanceRequest
        ? { connect: { id: maintenanceRequest.id } }
        : undefined,
      beCollectedByUser: data.beCollectedByUser?.id
        ? { connect: { id: data.beCollectedByUser.id } }
        : undefined,
      beCollectedByWorker: data.beCollectedByWorker?.id
        ? { connect: { id: data.beCollectedByWorker.id } }
        : undefined,
      status: MaterialPickingOrderStatus.PENDING_PREPARATION, // Initial status
      items: {
        create: items.map((item) => ({
          quantityToPick: item.quantityToPick,
          globalMaterial: { connect: { id: item.globalMaterialId } },
          materialInstance: item.materialInstanceId
            ? { connect: { id: item.materialInstanceId } }
            : undefined,
          materialRequestItem: item.materialRequestItemId
            ? { connect: { id: item.materialRequestItemId } }
            : undefined,
          notes: item.notes
        }))
      }
    };

    this.logger.log(`Criando o registro da ordem de separação no banco.`);
    const newOrder = await prisma.materialPickingOrder.create({
      data: createInput,
      include: {
        items: true
      }
    });
    this.logger.log(
      `Ordem de separação ${newOrder.id} criada. Iniciando criação das movimentações de estoque (reserva)...`
    );

    const orderInfoForMovement = {
      warehouseId: warehouse.id,
      processedByUserId: requestedByUser.id, // The user who requested is the one "processing" the reservation
      maintenanceRequestId: maintenanceRequest?.id,
      materialRequestId: materialRequest?.id
    };

    for (const item of newOrder.items) {
      this.logger.debug(
        `Processando item de separação ${item.id} para criar movimentação de estoque.`
      );

      const globalMaterialId = item.globalMaterialId;
      const materialInstanceId = item.materialInstanceId;

      if (!globalMaterialId && !materialInstanceId) {
        this.logger.warn(
          `Item de picking ${item.id} não tem material global nem instância. Pulando movimentação de estoque.`
        );
        continue;
      }

      await this._createStockMovement(prisma as any, {
        item,
        quantityChange: item.quantityToPick,
        order: orderInfoForMovement,
        movementSubType: MaterialStockOperationSubType.RESERVE_FOR_PICKING_ORDER
      });
    }

    this.logger.log(
      `Todas as movimentações de estoque criadas. Buscando ordem completa para retorno.`
    );

    return prisma.materialPickingOrder.findUniqueOrThrow({
      where: { id: newOrder.id },
      include: this.includeRelations
    });
  }

  /**
   * Método público para atualizar uma ordem de separação.
   * Gerencia a transação: inicia uma nova ou utiliza uma existente.
   */
  async update(
    id: number,
    data: UpdateMaterialPickingOrderWithRelationsDto,
    tx?: Prisma.TransactionClient
  ): Promise<MaterialPickingOrderWithRelationsResponseDto> {
    try {
      if (tx) {
        this.logger.log(
          `Executando a atualização dentro de uma transação existente.`
        );
        return await this._updatePickingOrderLogic(id, data, tx as any);
      }

      this.logger.log(
        `Iniciando uma nova transação para criar a atualização da ordem de separação.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._updatePickingOrderLogic(
          id,
          data,
          prismaTransactionClient as any
        );
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialPickingOrdersService', {
        operation: 'update',
        data
      });
      throw error;
    }
  }

  private async _updatePickingOrderLogic(
    id: number,
    data: UpdateMaterialPickingOrderWithRelationsDto,
    prisma: PrismaClient
  ): Promise<MaterialPickingOrderWithRelationsResponseDto> {
    this.logger.log(
      `Iniciando processo de atualização da ordem de separação ID: ${id}...`
    );

    // --- 1. BUSCAR DADOS ATUAIS ---
    const existingOrder = await prisma.materialPickingOrder.findUniqueOrThrow({
      where: { id },
      include: {
        items: true,
        materialRequest: { include: { items: true } }
      }
    });

    // --- 2. VALIDAÇÃO DE ESTADO ---
    // Impede a edição de ordens em estados finais.
    const uneditableStatuses: MaterialPickingOrderStatus[] = [
      MaterialPickingOrderStatus.CANCELLED,
      MaterialPickingOrderStatus.READY_FOR_PICKUP
      // Adicione outros status conforme necessário, ex: FULLY_WITHDRAWN
    ];
    if (uneditableStatuses.includes(existingOrder.status)) {
      throw new ConflictException(
        `Não é possível editar uma ordem de separação com status '${existingOrder.status}'.`
      );
    }

    const { items: itemsToUpdate } = data;

    // --- 3. VALIDAÇÃO DE QUANTIDADE (se aplicável) ---
    // Garante que a soma das reservas não exceda o solicitado na requisição de material.
    if (itemsToUpdate && existingOrder.materialRequest) {
      await this._canOrderPickingMaterialRequest(
        existingOrder.materialRequest.id,
        itemsToUpdate,
        id // Passa o ID da ordem atual para ser ignorado na validação
      );
    }

    // verificar de forma geral no deposito se tem saldo para os items que vão ser reservados na atualização.
    await this._canOrderPickingWarehouseStock(
      prisma as any,
      existingOrder.warehouseId,
      itemsToUpdate.map((item) => ({
        globalMaterialId: item.globalMaterialId,
        quantityToPick: item.quantityToPick
      })),
      id
    );

    // --- 4. LÓGICA DE MOVIMENTAÇÃO DE ESTOQUE (PRÉ-UPDATE) ---
    // ESTA PARTE SERÁ REFEITA PARA SER MAIS ROBUSTA
    if (itemsToUpdate) {
      // Mapeia itens existentes por uma chave de negócio (materialRequestItemId) se disponível
      const existingItemsMap = new Map(
        existingOrder.items.map((item) => [
          item.materialRequestItemId || `temp_${item.id}`, // Usa uma chave única
          item
        ])
      );
      const updatedItemKeys = new Set<number | string>();

      const orderInfoForMovement = {
        warehouseId: existingOrder.warehouseId,
        processedByUserId: existingOrder.requestedByUserId,
        maintenanceRequestId: existingOrder.maintenanceRequestId
      };

      for (const updatedItem of itemsToUpdate) {
        // A chave de negócio para encontrar o item correspondente
        const itemKey =
          updatedItem.materialRequestItemId || `temp_${updatedItem.id}`;
        updatedItemKeys.add(itemKey);

        const existingItem = existingItemsMap.get(itemKey);

        if (existingItem) {
          // --- É UMA ATUALIZAÇÃO ---
          const quantityDelta = new Decimal(updatedItem.quantityToPick).sub(
            existingItem.quantityToPick
          );
          if (!quantityDelta.isZero()) {
            await this._createStockMovement(prisma as any, {
              item: existingItem, // Use o item existente para ter todos os IDs
              quantityChange: quantityDelta,
              order: orderInfoForMovement,
              movementSubType: quantityDelta.isPositive()
                ? MaterialStockOperationSubType.RESERVE_FOR_PICKING_ORDER
                : MaterialStockOperationSubType.RELEASE_PICKING_RESERVATION
            });
          }
        } else {
          // --- É UM ITEM NOVO ---
          // A quantidade a ser movimentada é a própria quantidade do item.
          const quantityChange = new Decimal(updatedItem.quantityToPick);
          if (!quantityChange.isZero()) {
            await this._createStockMovement(prisma as any, {
              item: { ...updatedItem, id: -1 }, // ID temporário
              quantityChange: quantityChange, // Garantido ser Decimal
              order: orderInfoForMovement,
              movementSubType:
                MaterialStockOperationSubType.RESERVE_FOR_PICKING_ORDER
            });
          }
        }
      }

      // Identificar e processar itens removidos
      for (const [key, itemToDelete] of existingItemsMap.entries()) {
        if (!updatedItemKeys.has(key)) {
          await this._createStockMovement(prisma as any, {
            item: itemToDelete,
            quantityChange: itemToDelete.quantityToPick.negated(), // Devolve ao estoque
            order: orderInfoForMovement,
            movementSubType:
              MaterialStockOperationSubType.RELEASE_PICKING_RESERVATION
          });
        }
      }
    }

    // --- 5. CONSTRUÇÃO DO PAYLOAD DE ATUALIZAÇÃO (LÓGICA REFEITA) ---
    this.logger.debug(
      'Construindo payload de atualização granular para itens.'
    );
    const updatePayload: Prisma.MaterialPickingOrderUpdateInput = {};

    // Adiciona campos simples (não relacionados a itens)
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.desiredPickupDate)
      updatePayload.desiredPickupDate = data.desiredPickupDate;
    // ... outras relações simples como beCollectedByUser ...

    // ** LÓGICA CENTRAL PARA ATUALIZAÇÃO GRANULAR DE ITENS **
    if (itemsToUpdate) {
      const existingItemsMap = new Map(
        existingOrder.items.map((item) => [item.id, item])
      );
      // Usamos uma chave de negócio (materialRequestItemId) para identificar itens que não vêm com ID.
      const existingItemsByBusinessKey = new Map(
        existingOrder.items
          .filter((item) => item.materialRequestItemId)
          .map((item) => [item.materialRequestItemId, item])
      );

      const itemsToActuallyCreate: Prisma.MaterialPickingOrderItemCreateWithoutMaterialPickingOrderInput[] =
        [];
      const itemsToActuallyUpdate: {
        where: { id: number };
        data: Prisma.MaterialPickingOrderItemUpdateInput;
      }[] = [];
      const processedExistingItemIds = new Set<number>();

      for (const itemFromRequest of itemsToUpdate) {
        let existingItem = null;

        // Estratégia de correspondência:
        // 1. Tentar encontrar pelo ID do item da ordem de separação (mais confiável).
        if (itemFromRequest.id) {
          existingItem = existingItemsMap.get(itemFromRequest.id);
        }
        // 2. Se não, tentar encontrar pela chave de negócio (ID do item da requisição).
        else if (itemFromRequest.materialRequestItemId) {
          existingItem = existingItemsByBusinessKey.get(
            itemFromRequest.materialRequestItemId
          );
        }

        if (existingItem) {
          // --- CASO DE ATUALIZAÇÃO ---
          // O item já existe, vamos preparar um payload de atualização para ele.
          processedExistingItemIds.add(existingItem.id);
          itemsToActuallyUpdate.push({
            where: { id: existingItem.id },
            data: {
              // Apenas os campos que podem ser atualizados
              quantityToPick: itemFromRequest.quantityToPick,
              notes: itemFromRequest.notes
              // Não atualizamos chaves estrangeiras como globalMaterialId aqui
              // para manter a simplicidade. Se precisar, adicione-as.
            }
          });
          this.logger.debug(`Item ID ${existingItem.id} será ATUALIZADO.`);
        } else {
          // --- CASO DE CRIAÇÃO ---
          // Nenhum item correspondente encontrado, este é um novo item para a ordem.
          itemsToActuallyCreate.push({
            quantityToPick: itemFromRequest.quantityToPick,
            notes: itemFromRequest.notes,
            globalMaterial: {
              connect: { id: itemFromRequest.globalMaterialId }
            },
            materialInstance: itemFromRequest.materialInstanceId
              ? { connect: { id: itemFromRequest.materialInstanceId } }
              : undefined,
            materialRequestItem: itemFromRequest.materialRequestItemId
              ? { connect: { id: itemFromRequest.materialRequestItemId } }
              : undefined
          });
          this.logger.debug(
            `Um novo item para o material ${itemFromRequest.globalMaterialId} será CRIADO.`
          );
        }
      }

      // --- CASO DE REMOÇÃO ---
      // Itens existentes que não foram processados (nem por ID, nem por chave de negócio) devem ser removidos.
      const itemIdsToDelete = existingOrder.items
        .map((item) => item.id)
        .filter((id) => !processedExistingItemIds.has(id));

      if (itemIdsToDelete.length > 0) {
        this.logger.debug(
          `Itens com IDs [${itemIdsToDelete.join(', ')}] serão REMOVIDOS.`
        );
      }

      // Monta o payload final para a relação `items`
      updatePayload.items = {
        create: itemsToActuallyCreate,
        update: itemsToActuallyUpdate,
        delete: itemIdsToDelete.map((id) => ({ id }))
      };
    }

    // --- 6. EXECUÇÃO DA ATUALIZAÇÃO NO BANCO DE DADOS ---
    this.logger.debug(
      'Executando atualização com o payload:',
      JSON.stringify(updatePayload, null, 2)
    );
    const updatedOrderWithItems = await prisma.materialPickingOrder.update({
      where: { id },
      data: updatePayload,
      include: { items: true }
    });

    // --- 7. PÓS-ATUALIZAÇÃO (RECALCULAR STATUS) ---
    const newStatus = await this._calculatePickingOrderStatus(
      updatedOrderWithItems.items
    );
    await prisma.materialPickingOrder.update({
      where: { id },
      data: { status: newStatus }
    });

    this.logger.log(`Ordem de separação ${id} atualizada com sucesso.`);

    // --- 8. RETORNAR A ORDEM COMPLETA E FINAL ---
    return prisma.materialPickingOrder.findUniqueOrThrow({
      where: { id },
      include: this.includeRelations
    });
  }

  async delete(id: number): Promise<{ message: string; id: number }> {
    this.logger.log(`Iniciando exclusão da ordem de separação ID ${id}.`);
    try {
      this.logger.log(
        `Iniciando transação no banco de dados para exclusão da ordem ${id}.`
      );
      await this.prisma.$transaction(async (tx) => {
        const orderToDelete = await tx.materialPickingOrder.findUnique({
          where: { id },
          include: {
            items: true
          }
        });

        if (!orderToDelete) {
          this.logger.warn(
            `Ordem de separação ${id} não encontrada para exclusão (pode já ter sido deletada).`
          );
          return;
        }

        const orderInfo = {
          warehouseId: orderToDelete.warehouseId,
          processedByUserId: orderToDelete.requestedByUserId, // The user who requested is the one "processing" the release
          maintenanceRequestId: orderToDelete.maintenanceRequestId,
          materialRequestId: orderToDelete.materialRequestId
        };

        this.logger.log(
          `Liberando estoque para ${orderToDelete.items.length} itens da ordem ${id}.`
        );
        for (const item of orderToDelete.items) {
          const globalMaterialId = item.globalMaterialId;
          const materialInstanceId = item.materialInstanceId;

          if (!globalMaterialId && !materialInstanceId) {
            this.logger.warn(
              `Item de picking ${item.id} não tem material global nem instância. Pulando liberação de estoque.`
            );
            continue;
          }

          await this._createStockMovement(tx as PrismaTransactionClient, {
            item,
            quantityChange: item.quantityToPick.negated(),
            order: orderInfo,
            movementSubType:
              MaterialStockOperationSubType.RELEASE_PICKING_RESERVATION
          });
        }
        await tx.materialPickingOrder.delete({ where: { id } });
      });

      return {
        message:
          'Material Picking Order deleted and all associated stock released successfully',
        id: id
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialPickingOrdersService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }

  async list(): Promise<MaterialPickingOrderWithRelationsResponseDto[]> {
    try {
      return this.prisma.materialPickingOrder.findMany({
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialPickingOrdersService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(
    id: number
  ): Promise<MaterialPickingOrderWithRelationsResponseDto> {
    try {
      const materialPickingOrder =
        await this.prisma.materialPickingOrder.findUnique({
          where: { id },
          include: this.includeRelations
        });
      if (!materialPickingOrder) {
        throw new NotFoundException(
          `Material Picking Order with ID ${id} not found`
        );
      }
      return materialPickingOrder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaterialPickingOrdersService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }
}
