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

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class MaterialPickingOrdersService {
  private readonly logger = new Logger(MaterialPickingOrdersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly materialStockMovementsService: MaterialStockMovementsService
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
   * Valida se uma nova ordem de separação pode ser criada com base nas quantidades já reservadas.
   *
   * Este método verifica, para cada item da nova ordem de separação que está vinculado a uma requisição de material:
   * 1. Busca todas as reservas (itens de outras ordens de separação) já feitas para o mesmo item da requisição.
   * 2. Soma a quantidade da nova reserva com as quantidades já reservadas.
   * 3. Compara essa soma com a quantidade total originalmente solicitada na requisição de material.
   * 4. Lança uma exceção `ConflictException` se a soma ultrapassar o solicitado para qualquer item.
   *
   * @param tx O cliente Prisma da transação atual.
   * @param itemsPickingOrder Os itens da nova ordem de separação que está sendo criada.
   * @param itemsMaterialRequest Os itens da requisição de material original à qual a ordem de separação está vinculada.
   * @param pickingOrderIdToExclude O ID da ordem de separação a ser excluída da contagem de reservas (usado em atualizações).
   * @throws {ConflictException} Se a quantidade a ser reservada para qualquer item exceder o limite permitido.
   */
  private async _canOrderPicking(
    tx: PrismaClient,
    itemsPickingOrder: Array<{
      quantityToPick: Decimal;
      materialRequestItemId?: number;
    }>,
    itemsMaterialRequest: MaterialRequestWithRelationsResponseDto['items'],
    pickingOrderIdToExclude?: number // <-- NOVO PARÂMETRO
  ): Promise<void> {
    this.logger.debug(
      'Iniciando validação de quantidades da ordem de separação.'
    );

    // ... (lógica de mapeamento e extração de IDs permanece a mesma)
    const allowedQuantitiesMap = new Map<number, Decimal>(/*...*/);
    const relevantRequestItemIds = itemsPickingOrder
      .map((item) => item.materialRequestItemId)
      .filter((id): id is number => id != null);

    if (relevantRequestItemIds.length === 0) {
      this.logger.debug(
        'Nenhum item vinculado a uma requisição de material. Validação pulada.'
      );
      return;
    }

    // 3. Buscar todas as reservas *existentes* para esses itens, excluindo a ordem atual se aplicável.
    const previouslyReservedItems = await tx.materialPickingOrderItem.findMany({
      where: {
        materialRequestItemId: { in: relevantRequestItemIds },
        // AQUI ESTÁ A MUDANÇA CRÍTICA:
        id: pickingOrderIdToExclude
          ? { not: pickingOrderIdToExclude }
          : undefined
      },
      select: {
        materialRequestItemId: true,
        quantityToPick: true
      }
    });

    // 4. Calcular o total já reservado para cada item da requisição.
    const alreadyReservedMap = previouslyReservedItems.reduce((acc, item) => {
      const currentReserved =
        acc.get(item.materialRequestItemId) || new Decimal(0);
      acc.set(
        item.materialRequestItemId,
        currentReserved.add(item.quantityToPick)
      );
      return acc;
    }, new Map<number, Decimal>());

    // 5. Validar cada item da nova ordem de separação.
    for (const newItem of itemsPickingOrder) {
      if (!newItem.materialRequestItemId) {
        continue; // Ignora itens não vinculados a uma requisição.
      }

      const totalAllowed = allowedQuantitiesMap.get(
        newItem.materialRequestItemId
      );
      if (!totalAllowed) {
        // Isso indica uma inconsistência de dados, mas por segurança, tratamos como um erro.
        throw new BadRequestException(
          `O item da ordem de separação está vinculado a um item de requisição (ID: ${newItem.materialRequestItemId}) que não pertence à requisição de material informada.`
        );
      }

      const alreadyReserved =
        alreadyReservedMap.get(newItem.materialRequestItemId) || new Decimal(0);
      const newTotalReserved = alreadyReserved.add(newItem.quantityToPick);

      if (newTotalReserved.greaterThan(totalAllowed)) {
        throw new ConflictException(
          `Não é possível reservar a quantidade de ${newItem.quantityToPick} para o item de requisição ID ${newItem.materialRequestItemId}. ` +
            `Quantidade solicitada: ${totalAllowed}, ` +
            `Quantidade já reservada: ${alreadyReserved}, ` +
            `Nova quantidade total excederia o limite: ${newTotalReserved}.`
        );
      }
    }

    this.logger.debug(
      'Validação de quantidades da ordem de separação concluída com sucesso.'
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

      await this._canOrderPicking(prisma, items, materialRequestDB.items);

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

    const { items: updatedItems } = data;

    // --- 3. VALIDAÇÃO DE QUANTIDADE (se aplicável) ---
    // Garante que a soma das reservas não exceda o solicitado na requisição.
    if (updatedItems && existingOrder.materialRequest) {
      await this._canOrderPicking(
        prisma,
        updatedItems,
        existingOrder.materialRequest.items,
        id // Passa o ID da ordem atual para ser ignorado na validação
      );
    }

    // --- 4. LÓGICA DE MOVIMENTAÇÃO DE ESTOQUE (PRÉ-UPDATE) ---
    // Calcula as diferenças de quantidade e cria as movimentações de estoque antes de salvar.
    if (updatedItems) {
      const existingItemsMap = new Map(
        existingOrder.items.map((item) => [item.id, item])
      );
      const orderInfoForMovement = {
        warehouseId: existingOrder.warehouseId,
        processedByUserId: existingOrder.requestedByUserId, // Ou o ID do usuário que fez a atualização
        maintenanceRequestId: existingOrder.maintenanceRequestId
      };

      // Itera sobre os itens recebidos para identificar criações e atualizações
      for (const updatedItem of updatedItems) {
        if (updatedItem.id) {
          // É uma atualização de um item existente
          const existingItem = existingItemsMap.get(updatedItem.id);
          if (existingItem) {
            const quantityDelta = new Decimal(updatedItem.quantityToPick).sub(
              existingItem.quantityToPick
            );
            if (!quantityDelta.isZero()) {
              await this._createStockMovement(prisma as any, {
                item: updatedItem as any,
                quantityChange: quantityDelta,
                order: orderInfoForMovement,
                movementSubType: quantityDelta.isPositive()
                  ? MaterialStockOperationSubType.RESERVE_FOR_PICKING_ORDER
                  : MaterialStockOperationSubType.RELEASE_PICKING_RESERVATION
              });
            }
          }
        } else {
          // É um item novo a ser criado
          await this._createStockMovement(prisma as any, {
            item: { ...updatedItem, id: -1 }, // ID temporário
            quantityChange: updatedItem.quantityToPick,
            order: orderInfoForMovement,
            movementSubType:
              MaterialStockOperationSubType.RESERVE_FOR_PICKING_ORDER
          });
        }
      }

      // Itera sobre os itens existentes para identificar os que foram removidos
      const updatedItemIds = new Set(
        updatedItems.map((item) => item.id).filter(Boolean)
      );
      const itemsToDelete = existingOrder.items.filter(
        (item) => !updatedItemIds.has(item.id)
      );
      for (const itemToDelete of itemsToDelete) {
        await this._createStockMovement(prisma as any, {
          item: itemToDelete,
          quantityChange: itemToDelete.quantityToPick.negated(), // Devolve ao estoque
          order: orderInfoForMovement,
          movementSubType:
            MaterialStockOperationSubType.RELEASE_PICKING_RESERVATION
        });
      }
    }

    // --- 5. CONSTRUÇÃO DO PAYLOAD DE ATUALIZAÇÃO ---
    // Cria o payload de forma controlada para evitar erros de tipagem.
    const updatePayload: Prisma.MaterialPickingOrderUpdateInput = {};

    // Adiciona campos simples apenas se forem fornecidos no DTO
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.desiredPickupDate)
      updatePayload.desiredPickupDate = data.desiredPickupDate;

    // Lida com relações de conexão/desconexão
    if (data.beCollectedByUser) {
      updatePayload.beCollectedByUser = {
        connect: { id: data.beCollectedByUser.id }
      };
    } else if (data.beCollectedByUser === null) {
      updatePayload.beCollectedByUser = { disconnect: true };
    }
    if (data.beCollectedByWorker) {
      updatePayload.beCollectedByWorker = {
        connect: { id: data.beCollectedByWorker.id }
      };
    } else if (data.beCollectedByWorker === null) {
      updatePayload.beCollectedByWorker = { disconnect: true };
    }

    // Lida com a atualização aninhada de itens
    if (updatedItems) {
      updatePayload.items = {
        deleteMany: {
          id: {
            in: existingOrder.items
              .filter((item) => !updatedItems.some((ui) => ui.id === item.id))
              .map((i) => i.id)
          }
        },
        upsert: updatedItems.map((item) => {
          const createPayload: Prisma.MaterialPickingOrderItemCreateWithoutMaterialPickingOrderInput =
            {
              quantityToPick: item.quantityToPick,
              notes: item.notes,
              globalMaterial: { connect: { id: item.globalMaterialId } },
              materialInstance: item.materialInstanceId
                ? { connect: { id: item.materialInstanceId } }
                : undefined,
              materialRequestItem: item.materialRequestItemId
                ? { connect: { id: item.materialRequestItemId } }
                : undefined
            };
          const updatePayload: Prisma.MaterialPickingOrderItemCreateWithoutMaterialPickingOrderInput =
            {
              quantityToPick: item.quantityToPick,
              notes: item.notes
            };
          return {
            where: { id: item.id || -1 }, // -1 garante que itens sem ID sejam criados
            create: createPayload,
            update: updatePayload
          };
        })
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
