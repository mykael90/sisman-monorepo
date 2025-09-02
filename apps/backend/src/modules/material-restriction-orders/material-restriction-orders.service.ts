import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
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
  RestrictionOrderStatus,
  PrismaClient
} from '@sisman/prisma';
import { MaterialStockMovementsService } from '../material-stock-movements/material-stock-movements.service';
import { CreateMaterialStockMovementWithRelationsDto } from '../material-stock-movements/dto/material-stock-movements.dto';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';
import { MaterialRequestWithRelationsResponseDto } from '../material-requests/dto/material-request.dto';
import { MaterialRequestsService } from '../material-requests/material-requests.service';

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class MaterialRestrictionOrdersService {
  private readonly logger = new Logger(MaterialRestrictionOrdersService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly materialStockMovementsService: MaterialStockMovementsService,
    private readonly materialRequestService: MaterialRequestsService
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
        globalMaterialId?: string;
        materialInstanceId?: number;
        targetMaterialRequestItemId?: number;
      };
      quantityChange: Decimal;
      order: {
        warehouseId: number;
        processedByUserId: number;
        maintenanceRequestId?: number;
      };
      // movementSubType: MaterialStockOperationSubType;
    }
  ) {
    if (params.quantityChange.isZero()) {
      this.logger.debug(
        `Item de restrição ${params.item.id} com alteração de quantidade zero, pulando movimentação de estoque.`
      );
      return;
    }

    const movementType = params.quantityChange.isPositive()
      ? MaterialStockOperationSubType.RESTRICT_FOR_PAID_ITEM
      : MaterialStockOperationSubType.RELEASE_PAID_RESTRICTION;

    this.logger.log(
      `Criando movimentação de estoque do tipo '${movementType}' para o item de restrição ${params.item.id} com quantidade ${params.quantityChange.abs()}.`
    );

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
      maintenanceRequest: params.order.maintenanceRequestId
        ? ({
            id: params.order.maintenanceRequestId
          } as any)
        : undefined
    };

    await this.materialStockMovementsService.create(movementPayload, tx as any);
  }

  /**
   * #1 & #4: Calcula o status da ordem comparando com a MaterialRequest.
   */
  private async _calculateRestrictionStatus(
    materialRequest: MaterialRequestWithRelationsResponseDto,
    restrictionItems: { quantityRestricted: Decimal }[]
  ): Promise<RestrictionOrderStatus> {
    this.logger.debug(
      `Calculando status da restrição para a requisição ${materialRequest.id}.`
    );
    const totalRestricted = restrictionItems.reduce(
      (sum, item) => sum.add(item.quantityRestricted),
      new Decimal(0)
    );

    if (totalRestricted.isZero()) {
      this.logger.debug(`Total restrito é zero. Status: FREE.`);
      return RestrictionOrderStatus.FREE;
    }

    const totalRequested = materialRequest.items.reduce(
      (sum, item) => sum.add(item.quantityRequested),
      new Decimal(0)
    );

    this.logger.debug(
      `Total Restrito: ${totalRestricted}, Total Requisitado: ${totalRequested}.`
    );

    if (totalRestricted.gte(totalRequested)) {
      this.logger.debug(
        `Total restrito >= total requisitado. Status: FULLY_RESTRICTED.`
      );
      return RestrictionOrderStatus.FULLY_RESTRICTED;
    }

    this.logger.debug(`Status: PARTIALLY_RESTRICTED.`);
    return RestrictionOrderStatus.PARTIALLY_RESTRICTED;
  }

  private async _restrictionOrderForMaterialRequestExists(
    prisma: PrismaClient,
    materialRequestId: number
  ): Promise<void> {
    //a relação de RestrictionOrder com MaterialRequest é de 1 para 1, se já existir o registro retorne com o erro
    const restrictionOrder = await prisma.materialRestrictionOrder.findFirst({
      include: { targetMaterialRequest: true },
      where: { targetMaterialRequest: { id: materialRequestId } }
    });
    if (restrictionOrder) {
      throw new ConflictException(
        `Já existe uma ordem de restrição para a requisição de material ID ${materialRequestId}, protocolo ${restrictionOrder.targetMaterialRequest.protocolNumber}.`
      );
    }
  }

  /**
   * Método público para criar uma ordem de restrição.
   * Gerencia a transação: inicia uma nova ou utiliza uma existente.
   */
  async create(
    data: CreateMaterialRestrictionOrderWithRelationsDto,
    // O tx opcional já estava correto na sua assinatura
    tx?: Prisma.TransactionClient
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    try {
      // Se um 'tx' (cliente de transação) for fornecido, use-o diretamente.
      if (tx) {
        this.logger.log(
          `Executando a criação dentro de uma transação existente.`
        );
        // Passamos o 'tx' para o método que contém a lógica de negócio.
        return await this._createRestrictionOrderLogic(data, tx as any);
      }

      // Se nenhum 'tx' for fornecido, crie uma nova transação.
      this.logger.log(
        `Iniciando uma nova transação para criar a ordem de restrição.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        // Passamos o cliente da nova transação para o método de lógica.
        return await this._createRestrictionOrderLogic(
          data,
          prismaTransactionClient as any
        );
      });
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
      throw error; // Re-lança o erro para ser tratado pela camada superior.
    }
  }

  private async _createRestrictionOrderLogic(
    data: CreateMaterialRestrictionOrderWithRelationsDto,
    prisma: PrismaClient // Usamos o tipo genérico aqui
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    this.logger.log(`Iniciando processo de criação de ordem de restrição...`);
    const {
      warehouse,
      processedByUser,
      targetMaterialRequest,
      status,
      ...restOfData
    } = data;
    let { items } = data;
    let maintenanceRequestId: number | undefined;

    if (targetMaterialRequest) {
      if (!targetMaterialRequest?.id) {
        throw new BadRequestException(
          'targetMaterialRequest.id é obrigatório para criar uma ordem de restrição.'
        );
      }

      try {
        await this._restrictionOrderForMaterialRequestExists(
          prisma,
          targetMaterialRequest.id
        );
        let finalStatus = status;

        this.logger.log(
          `Buscando requisição de material ID ${targetMaterialRequest.id}.`
        );
        //consulta a materialRequest para pegar a requisição de manutenção e os itens
        const materialRequestDB: MaterialRequestWithRelationsResponseDto =
          await prisma.materialRequest.findUnique({
            where: { id: targetMaterialRequest.id },
            include: { items: true }
          });
        if (!materialRequestDB) {
          throw new BadRequestException(
            `Requisição de material ID ${targetMaterialRequest.id} não encontrada para ordem de  restrição.`
          );
        }

        maintenanceRequestId = materialRequestDB.maintenanceRequestId;

        if (status === RestrictionOrderStatus.FULLY_RESTRICTED) {
          this.logger.log(
            `Status é FULLY_RESTRICTED. Gerando itens de restrição a partir da requisição de material.`
          );
          if (materialRequestDB.items.length === 0) {
            throw new BadRequestException(
              `Requisição de material ID ${targetMaterialRequest.id} não encontrada ou vazia para restrição total.`
            );
          }
          items = materialRequestDB.items.map(
            (reqItem) =>
              ({
                quantityRestricted: reqItem.quantityRequested,
                globalMaterialId: reqItem.requestedGlobalMaterialId,
                materialInstanceId: reqItem.fulfilledByInstanceId,
                targetMaterialRequestItemId: reqItem.id
              }) as any
          );
        } else if (!status) {
          this.logger.log(
            `Status não fornecido. Calculando status com base nos itens.`
          );
          if (items.length === 0) {
            throw new BadRequestException(`Não há itens para restrição.`);
          }
          finalStatus = await this._calculateRestrictionStatus(
            materialRequestDB,
            items ?? []
          );
        }

        // verificar o saldo efetivo livre dos itens da requisicao de material
        await this._canRestrict(targetMaterialRequest.id, items);

        const createInput: Prisma.MaterialRestrictionOrderCreateInput = {
          ...restOfData,
          status: finalStatus,
          warehouse: { connect: { id: warehouse.id } },
          processedByUser: { connect: { id: processedByUser.id } },
          targetMaterialRequest: {
            connect: { id: targetMaterialRequest.id }
          },
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

        this.logger.log(`Criando o registro da ordem de restrição no banco.`);
        const newOrder = await prisma.materialRestrictionOrder.create({
          data: createInput,
          include: { items: true }
        });
        this.logger.log(
          `Ordem de restrição ${newOrder.id} criada. Iniciando criação das movimentações de estoque...`
        );
        for (const item of newOrder.items) {
          this.logger.debug(
            `Processando item de restrição ${item.id} para criar movimentação de estoque.`
          );
          await this._createStockMovement(prisma as any, {
            item,
            quantityChange: item.quantityRestricted,
            order: {
              warehouseId: warehouse.id,
              processedByUserId: processedByUser.id,
              maintenanceRequestId: maintenanceRequestId
            }
          });
        }

        this.logger.log(
          `Todas as movimentações de estoque criadas. Buscando ordem completa para retorno.`
        );

        this.logger.log(`Transação concluída. Retornando ordem completa.`);

        return prisma.materialRestrictionOrder.findUniqueOrThrow({
          where: { id: newOrder.id },
          include: this.includeRelations
        });
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
  }

  /**
   * Método público para atualizar uma ordem de restrição.
   * Gerencia a transação: inicia uma nova ou utiliza uma existente.
   */
  async update(
    id: number,
    data: UpdateMaterialRestrictionOrderWithRelationsDto,
    // O tx opcional já estava correto na sua assinatura
    tx?: Prisma.TransactionClient
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    try {
      // Se um 'tx' (cliente de transação) for fornecido, use-o diretamente.
      if (tx) {
        this.logger.log(
          `Executando a atualização dentro de uma transação existente.`
        );
        // Passamos o 'tx' para o método que contém a lógica de negócio.
        return await this._updateRestrictionOrderLogic(id, data, tx as any);
      }

      // Se nenhum 'tx' for fornecido, crie uma nova transação.
      this.logger.log(
        `Iniciando uma nova transação para criar a atualização da ordem de restrição.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        // Passamos o cliente da nova transação para o método de lógica.
        return await this._updateRestrictionOrderLogic(
          id,
          data,
          prismaTransactionClient as any
        );
      });
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialRestrictionOrdersService',
        {
          operation: 'update',
          data
        }
      );
      throw error; // Re-lança o erro para ser tratado pela camada superior.
    }
  }

  private async _updateRestrictionOrderLogic(
    id: number,
    data: UpdateMaterialRestrictionOrderWithRelationsDto,
    // O tx opcional já estava correto na sua assinatura
    prisma?: PrismaClient
  ): Promise<MaterialRestrictionOrderWithRelationsResponseDto> {
    this.logger.log(`Iniciando atualização da ordem de restrição ID ${id}.`);
    const { status, items: itemsToUpdate, ...restOfData } = data;

    try {
      this.logger.log(`Buscando ordem de restrição atual (ID: ${id}).`);
      const currentOrder = await prisma.materialRestrictionOrder.findUnique({
        where: { id },
        include: {
          items: true,
          targetMaterialRequest: { include: { items: true } }
        }
      });

      if (!currentOrder) {
        throw new NotFoundException(
          `Ordem de restrição ID ${id} não encontrada.`
        );
      }

      const targetRequestId =
        data.targetMaterialRequest?.id ?? currentOrder.targetMaterialRequestId;
      if (!targetRequestId) {
        throw new BadRequestException(
          'Não é possível atualizar sem uma requisição de material alvo.'
        );
      }

      const orderInfoForMovement = {
        warehouseId: data.warehouse?.id ?? currentOrder.warehouseId,
        processedByUserId:
          data.processedByUser?.id ?? currentOrder.processedByUserId,
        maintenanceRequestId:
          currentOrder.targetMaterialRequest?.maintenanceRequestId
      };

      let finalStatus = status;
      let itemsPayload: Prisma.MaterialRestrictionOrderItemUpdateManyWithoutMaterialRestrictionOrderNestedInput =
        {};

      // // #3: Se o status for FREE, zera todos os itens e libera o estoque
      // if (status === RestrictionOrderStatus.FREE) {
      //   this.logger.log(
      //     `Status definido como FREE. Liberando todo o estoque para a ordem ${id}.`
      //   );
      //   for (const item of currentOrder.items) {
      //     await this._createStockMovement(prisma as any, {
      //       item,
      //       quantityChange: item.quantityRestricted.negated(), // Libera o estoque
      //       order: orderInfoForMovement
      //     });
      //   }
      //   itemsPayload = {
      //     updateMany: {
      //       where: { materialRestrictionOrderId: id },
      //       data: { quantityRestricted: 0 }
      //     }
      //   };
      // }
      // // #2: Se o status for FULLY_RESTRICTED, reconcilia todos os itens
      // else if (status === RestrictionOrderStatus.FULLY_RESTRICTED) {
      //   this.logger.log(
      //     `Status definido como FULLY_RESTRICTED. Reconciliando itens da ordem ${id} com a requisição ${targetRequestId}.`
      //   );
      //   const currentItemsMap = new Map(
      //     currentOrder.items.map((item) => [
      //       item.targetMaterialRequestItemId,
      //       item
      //     ])
      //   );
      //   const requestItemsMap = new Map(
      //     currentOrder.targetMaterialRequest.items.map((item) => [
      //       item.id,
      //       item
      //     ])
      //   );

      //   const createOps: Prisma.MaterialRestrictionOrderItemCreateWithoutMaterialRestrictionOrderInput[] =
      //     [];
      //   const updateOps: {
      //     where: { id: number };
      //     data: { quantityRestricted: Decimal };
      //   }[] = [];
      //   const deleteOps: { id: number }[] = [];

      //   // Verifica o que criar ou atualizar
      //   for (const [reqItemId, reqItem] of requestItemsMap.entries()) {
      //     this.logger.debug(`Reconciliando item da requisição ${reqItemId}.`);
      //     const currentItem = currentItemsMap.get(reqItemId);
      //     if (currentItem) {
      //       // Item existe, precisa atualizar
      //       const diff = reqItem.quantityRequested.sub(
      //         currentItem.quantityRestricted
      //       );
      //       this.logger.debug(
      //         `Item ${currentItem.id} existe. Diferença de quantidade: ${diff}.`
      //       );
      //       // ajustando movimento de estoque
      //       await this._createStockMovement(prisma as any, {
      //         item: currentItem,
      //         quantityChange: diff,
      //         order: orderInfoForMovement
      //       });
      //       //inserindo no array de atualização
      //       updateOps.push({
      //         where: { id: currentItem.id },
      //         data: { quantityRestricted: reqItem.quantityRequested }
      //       });
      //       currentItemsMap.delete(reqItemId); // Marca como processado
      //     } else {
      //       // Item não existe, precisa criar
      //       this.logger.debug(
      //         `Item para ${reqItemId} não existe. Será criado.`
      //       );
      //       const newRestrictionItemData = {
      //         quantityRestricted: reqItem.quantityRequested,
      //         globalMaterial: {
      //           connect: { id: reqItem.requestedGlobalMaterialId }
      //         },
      //         materialInstance: reqItem.fulfilledByInstanceId
      //           ? { connect: { id: reqItem.fulfilledByInstanceId } }
      //           : undefined,
      //         targetMaterialRequestItem: { connect: { id: reqItem.id } }
      //       };
      //       //inserindo no array de criaçãO
      //       createOps.push(newRestrictionItemData);
      //       // O movimento de estoque será criado após a criação do item.
      //       // É necessário ter a priori o materialRestrictionItemId para criar o movimento
      //     }
      //   }
      //   // O que sobrou no currentItemsMap precisa ser deletado
      //   for (const itemToDelete of currentItemsMap.values()) {
      //     this.logger.debug(
      //       `Item ${itemToDelete.id} não está na requisição. Será deletado.`
      //     );
      //     await this._createStockMovement(prisma as any, {
      //       item: itemToDelete,
      //       quantityChange: itemToDelete.quantityRestricted.negated(),
      //       order: orderInfoForMovement
      //     });
      //     deleteOps.push({ id: itemToDelete.id });
      //   }

      //   this.logger.log(
      //     `Reconciliação resultou em: ${createOps.length} criações, ${updateOps.length} atualizações, ${deleteOps.length} deleções.`
      //   );

      //   itemsPayload = {
      //     create: createOps,
      //     update: updateOps,
      //     delete: deleteOps
      //   };
      // }

      // Vou permitir somente atualização manual de items, se precisar de logica para fazer tudo junto eu fgaço no frontend.
      // Dessa forma simplifica as verificações de saldo livre na requisição de material.
      // #4: Atualização manual de itens, sem um status explícito
      if (itemsToUpdate && !status) {
        this.logger.log(`Atualizando itens manualmente para a ordem ${id}.`);
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
          this.logger.debug(
            `Atualizando item ${currentItem.id}. Nova quantidade: ${newQuantity}, Diferença: ${diff}.`
          );
          await this._createStockMovement(prisma as any, {
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
        this.logger.log(
          `Recalculando status da ordem ${id} após atualização manual.`
        );
        const finalItemsState = currentOrder.items.map((item) => {
          const updatedItem = itemsToUpdate.find((u) => u.id === item.id);
          return updatedItem
            ? {
                ...item,
                quantityRestricted: new Decimal(updatedItem.quantityRestricted)
              }
            : item;
        });
        finalStatus = await this._calculateRestrictionStatus(
          currentOrder.targetMaterialRequest,
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

      // verificar o saldo efetivo livre dos itens da requisicao de material para atualizacao
      await this._canRestrict(targetRequestId, itemsToUpdate, id);

      this.logger.log(`Aplicando atualizações na ordem de restrição ${id}.`);
      const updatedOrder = await prisma.materialRestrictionOrder.update({
        where: { id },
        data: updatePayload
      });

      // Se houve criação, precisamos gerar os movimentos para os novos itens, agora já com materialRestrictionItemId
      if (
        itemsPayload.create &&
        Array.isArray(itemsPayload.create) &&
        itemsPayload.create.length > 0
      ) {
        this.logger.log(
          `Criando movimentações de estoque para os ${itemsPayload.create.length} novos itens.`
        );
        const newItems = await prisma.materialRestrictionOrderItem.findMany({
          where: {
            materialRestrictionOrderId: updatedOrder.id,
            id: { notIn: currentOrder.items.map((i) => i.id) }
          }
        });
        for (const newItem of newItems) {
          await this._createStockMovement(prisma as any, {
            item: newItem,
            quantityChange: newItem.quantityRestricted,
            order: orderInfoForMovement
          });
        }
      }

      this.logger.log(
        `Atualização concluída. Buscando ordem completa para retorno.`
      );
      return prisma.materialRestrictionOrder.findUniqueOrThrow({
        where: { id },
        include: this.includeRelations
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
    this.logger.log(`Iniciando exclusão da ordem de restrição ID ${id}.`);
    try {
      this.logger.log(
        `Iniciando transação no banco de dados para exclusão da ordem ${id}.`
      );
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

        this.logger.log(
          `Liberando estoque para ${orderToDelete.items.length} itens da ordem ${id}.`
        );
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

  /**
   * Valida se uma nova ordem de restrição pode ser criada ou atualizada.
   * Verifica contra o saldo efetivo livre. (já está fisicamente no estoque)
   */
  private async _canRestrict(
    materialRequestId: number,
    itemsToRestrict: Array<{
      quantityRestricted: Prisma.Decimal;
      targetMaterialRequestItemId: number;
    }>,
    restrictionIdToExclude?: number
  ): Promise<void> {
    await this.materialRequestService.validateOperationAgainstBalanceAndCheckItemsForRelease(
      materialRequestId,
      itemsToRestrict.map((item) => ({
        materialRequestItemId: item.targetMaterialRequestItemId,
        quantity: item.quantityRestricted
      })),
      {
        type: 'RESTRICTION',
        balanceToCheck: 'effective', // Restrições também impactam o saldo físico
        idToExclude: { restrictionIdToExclude }
      }
    );
  }
}
