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
import {
  CreateMaterialWithdrawalWithRelationsDto,
  MaterialWithdrawalWithRelationsResponseDto
} from '../material-withdrawals/dto/material-withdrawal.dto';
import { MaterialWithdrawalsService } from '../material-withdrawals/material-withdrawals.service';
import {
  UpdateMaterialRestrictionOrderItemDto,
  UpdateMaterialRestrictionOrderWithRelationsDto
} from '../material-restriction-orders/dto/material-restriction-order.dto';
import { MaterialRestrictionOrdersService } from '../material-restriction-orders/material-restriction-orders.service';

type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class MaterialPickingOrdersService {
  private readonly logger = new Logger(MaterialPickingOrdersService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly materialStockMovementsService: MaterialStockMovementsService,
    private readonly materialRequestsService: MaterialRequestsService,
    private readonly warehousesService: WarehousesService,
    private readonly materialWithdrawalsService: MaterialWithdrawalsService,
    private readonly materialRestrictionOrdersService: MaterialRestrictionOrdersService
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
    pickingItems: {
      quantityToPick: Decimal;
      quantityPicked?: Decimal;
      quantityWithdrawn?: Decimal;
    }[]
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
    const totalWithdrawn = pickingItems.reduce(
      (sum, item) => sum.add(item.quantityWithdrawn || 0),
      new Decimal(0)
    );

    if (totalPicked.isZero() && totalWithdrawn.isZero()) {
      return MaterialPickingOrderStatus.PENDING_PREPARATION;
    }

    if (totalPicked.gte(totalToPick)) {
      return MaterialPickingOrderStatus.READY_FOR_PICKUP;
    }

    if (totalWithdrawn.gte(totalToPick)) {
      return MaterialPickingOrderStatus.FULLY_WITHDRAWN;
    }

    if (totalPicked.lt(totalToPick)) {
      return MaterialPickingOrderStatus.IN_PREPARATION;
    }

    //na lógica dessa aplicação esse status não vai ser mais permitido. a regra em _verifyQuantitiesConsistency garante isso!
    if (totalWithdrawn.lt(totalToPick)) {
      return MaterialPickingOrderStatus.PARTIALLY_WITHDRAWN;
    }

    return MaterialPickingOrderStatus.IN_PREPARATION; // Or PARTIALLY_PREPARED if we want more granularity
  }

  /**
   * Dispara a criação de um registro de 'MaterialWithdrawal' (Retirada de Material)
   * quando uma ordem de separação atinge o estado 'FULLY_WITHDRAWN'.
   *
   * Esta função atua como uma ponte entre o processo de separação e o de retirada efetiva,
   * automatizando a criação do registro de saída de material. Ela transforma os dados
   * de uma ordem de separação concluída em um DTO de criação de retirada e invoca
   * o serviço correspondente, garantindo a atomicidade da operação ao propagar
   * a transação do Prisma.
   *
   * @param data - O objeto completo da ordem de separação, incluindo suas relações,
   *               que servirá de base para a criação da retirada.
   * @param tx - O cliente de transação do Prisma, para garantir que esta operação
   *             seja parte de uma transação maior (geralmente a que atualiza a ordem de separação).
   * @returns Uma promessa que resolve para o DTO de resposta da retirada de material recém-criada.
   *          Retorna `undefined` se não houver itens a serem retirados.
   */
  private async _callMaterialWithdrawalLogicCreate(
    data: MaterialPickingOrderWithRelationsResponseDto,
    tx?: Prisma.TransactionClient
  ): Promise<MaterialWithdrawalWithRelationsResponseDto> {
    this.logger.log(
      `Iniciando criação de retirada de material para a ordem de separação ID: ${data.id}`
    );

    const createWithdrawalDto: CreateMaterialWithdrawalWithRelationsDto = {
      warehouse: data.warehouse,
      processedByUser: data.requestedByUser, // Assumindo que o solicitante da separação é quem processa a retirada
      collectedByUser: data.beCollectedByUser,
      collectedByWorker: data.beCollectedByWorker,
      withdrawalDate: new Date(),
      maintenanceRequest: data.maintenanceRequest,
      materialRequest: data.materialRequest,
      materialPickingOrder: { id: data.id } as any,
      // O tipo de movimento para uma retirada de uma ordem de separação.
      // Pode ser ajustado conforme a regra de negócio.
      movementType: {
        code: data.maintenanceRequestId
          ? MaterialStockOperationSubType.OUT_SERVICE_USAGE
          : MaterialStockOperationSubType.OUT_EMERGENCY_USAGE
      } as any,
      notes: `Retirada automática referente à Ordem de Separação nº ${data.pickingOrderNumber}`,
      items: data.items
        .filter((item) => new Decimal(item.quantityToPick || 0).greaterThan(0))
        .map((item) => ({
          globalMaterialId: item.globalMaterialId,
          materialInstanceId: item.materialInstanceId,
          quantityWithdrawn: item.quantityToPick,
          materialRequestItemId: item.materialRequestItemId,
          unitPrice: item.unitPrice
        })),
      valueWithdrawal: data.valuePickingOrder,
      legacy_place: data.legacy_place
    };

    if (createWithdrawalDto.items.length === 0) {
      this.logger.warn(
        `Nenhum item com quantidade retirada encontrada para a ordem de separação ID: ${data.id}. A retirada não será criada.`
      );
      return;
    }

    // Chama o serviço de retirada, passando o cliente da transação para manter a atomicidade.
    // Não precisamos do 'await' aqui se não formos usar o resultado, mas é bom para propagar erros.
    // É bom fazer um metodo de retirada proprio para chamadas vindas da reserva, não precisa de algumas verificações que já foram feitas durante a reserva
    return await this.materialWithdrawalsService.create(
      createWithdrawalDto,
      tx,
      true
    );
  }

  /**
   * Verifica a consistência das quantidades (a separar, separada, retirada) para uma lista de itens.
   * A lógica de negócio é que o material retirado é um movimento que consome o material que foi previamente separado (reservado).
   * Portanto, a quantidade retirada não pode exceder a quantidade separada.
   *
   * @param items - Um array de itens da ordem de separação a serem verificados.
   * @throws {BadRequestException} se qualquer uma das quantidades for inconsistente.
   */
  private _verifyQuantitiesConsistency(
    items: {
      id?: number; // Opcional, mas útil para mensagens de erro
      globalMaterialId?: string; // Alternativa para identificar o item
      quantityToPick: Decimal | number | string;
      quantityPicked?: Decimal | number | string;
      quantityWithdrawn?: Decimal | number | string;
    }[]
  ) {
    for (const item of items) {
      // Garante que estamos trabalhando com instâncias de Decimal para comparações seguras
      const quantityToPick = new Decimal(item.quantityToPick);
      const quantityPicked = new Decimal(item.quantityPicked || 0);
      const quantityWithdrawn = new Decimal(item.quantityWithdrawn || 0);

      const itemIdentifier = item.id
        ? `de ID ${item.id}`
        : `do material ${item.globalMaterialId}`;

      // 1. A quantidade separada (reservada para retirada) não pode ser maior que a quantidade solicitada.
      if (quantityPicked.greaterThan(quantityToPick)) {
        throw new BadRequestException(
          `A quantidade separada (${quantityPicked}) para o item ${itemIdentifier} não pode ser maior que a quantidade solicitada para separação (${quantityToPick}).`
        );
      }

      // 2. A quantidade retirada não pode ser maior que a quantidade que já foi separada. Esse não faz sentido para mim, eu vou precisar colocar diminuir quantidade reservada para aumentar a quantidade retirada.
      // if (quantityWithdrawn.greaterThan(quantityPicked)) {
      //   throw new BadRequestException(
      //     `A quantidade retirada (${quantityWithdrawn}) para o item ${itemIdentifier} não pode ser maior que a quantidade que foi efetivamente separada (${quantityPicked}).`
      //   );
      // }

      // 3. A soma da quantidade retirada mais reservada não pode superar a quantidade solicitada.
      if (quantityWithdrawn.add(quantityPicked).greaterThan(quantityToPick)) {
        throw new BadRequestException(
          `A soma da quantidade retirada (${quantityWithdrawn}) e da quantidade reservada (${quantityPicked}) para o item ${itemIdentifier} não pode superar a quantidade solicitada para separação (${quantityToPick}).`
        );
      }

      // 4. Não vou permitir saída parcial, complica muito a lógica para garantir a transação consistente (atomicidade)
      // Dessa forma, se inserir item de retirada, quantityPicked deve está zerada, e quantitade retirada tem que ser igual a solicitada
      if (quantityWithdrawn.greaterThan(0) && !quantityPicked.isZero()) {
        throw new BadRequestException(
          `Só é permitido fazer retiradas totais. A quantidade retirada da reserva deve ser igual a quantidade solicitada.`
        );
      }

      if (
        quantityWithdrawn.greaterThan(0) &&
        !quantityWithdrawn.minus(quantityToPick).isZero()
      ) {
        throw new BadRequestException(
          `A quantidade retirada deve ser igual a quantidade solicitada.`
        );
      }
    }
  }

  /**
   * Valida se uma nova ordem de separação (reserva) pode ser criada ou atualizada.
   * Verifica contra o saldo potencial livre.
   */
  private async _canOrderPickingMaterialRequestForToPick(
    materialRequestId: number,
    itemsPickingOrder: Array<{
      quantityToPick: Prisma.Decimal; //items com intencao de reserva
      materialRequestItemId: number;
    }>,
    pickingOrderIdToExclude?: number
  ): Promise<void | UpdateMaterialRestrictionOrderItemDto[]> {
    await this.materialRequestsService.validateOperationAgainstBalanceAndCheckItemsForRelease(
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
   * Valida se uma nova ordem de separação (reserva) pode ser criada ou atualizada.
   * Verifica contra o saldo potencial livre.
   * Retorna um objeto com items a serem liberados da ordem de restrição se houver necessidade para items efetivamente reservados
   */
  private async _canOrderPickingMaterialRequestAndNeedReleaseForPicked(
    materialRequestId: number,
    itemsPickingOrder: Array<{
      quantityPicked: Prisma.Decimal; //items efetivamente reservados
      materialRequestItemId: number;
    }>,
    pickingOrderIdToExclude?: number
  ): Promise<void | UpdateMaterialRestrictionOrderItemDto[]> {
    return await this.materialRequestsService.validateOperationAgainstBalanceAndCheckItemsForRelease(
      materialRequestId,
      // Mapeia do formato específico para o genérico
      itemsPickingOrder.map((item) => ({
        materialRequestItemId: item.materialRequestItemId,
        quantity: item.quantityPicked
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
    const {
      warehouse,
      requestedByUser,
      materialRequest,
      proccessedByUser,
      ...restOfData
    } = data;

    let { items } = data;
    let { maintenanceRequest } = data;

    let materialRequestDB: MaterialRequestWithRelationsResponseDto;

    if (!items || items.length === 0) {
      throw new BadRequestException(
        'É necessário fornecer itens ou vincular uma requisição de material para criar uma ordem de separação.'
      );
    }

    this._verifyQuantitiesConsistency(items);

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

      //  se a reserva estiver relacionada a uma requisição de material, verificar o saldo efetivo livre dos itens
      // Nessa verificação retorna um update do restrictionOrderItem da requisicao de material caso precise liberar itens restritos para retirada
      const updateItemsForRestrictionOrder =
        await this._canOrderPickingMaterialRequestForToPick(
          materialRequest.id,
          items
        );

      //se tiver retorno, precisa liberar um ou mais itens das restrições
      //na verdade aqui é apenas a intenção de reserva, dessa forma não há movimentação e eu decidi comentar a logica abaixo
      // if (updateItemsForRestrictionOrder) {
      //   const restrictionOrder =
      //     await this.prisma.materialRestrictionOrder.findUnique({
      //       where: {
      //         targetMaterialRequestId: materialRequest.id
      //       },
      //       include: {
      //         items: true
      //       }
      //     });

      //   const updatesMap = new Map(
      //     updateItemsForRestrictionOrder.map((item) => [
      //       item.targetMaterialRequestItemId,
      //       item
      //     ])
      //   );

      //   //logica para sobrescrever os items que precisam ser mudados
      //   const mergedItems = restrictionOrder.items.map((item) => {
      //     const update = updatesMap.get(item.targetMaterialRequestItemId);
      //     return update ? { ...item, ...update } : item;
      //   });

      //   const updateRestrictionOrder: UpdateMaterialRestrictionOrderWithRelationsDto =
      //     {
      //       id: restrictionOrder.id,
      //       processedByUser: proccessedByUser
      //         ? ({ id: proccessedByUser.id } as any)
      //         : undefined,
      //       processedAt: new Date(),
      //       items: mergedItems
      //     };

      //   // atualizar a ordem de restricao para liberar os items necessarios para retirada
      //   await this.materialRestrictionOrdersService.update(
      //     restrictionOrder.id,
      //     updateRestrictionOrder,
      //     prisma as any
      //   );
      // }

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
      proccessedByUser: data.proccessedByUser?.id
        ? { connect: { id: data.proccessedByUser.id } }
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
          unitPrice: item.unitPrice,
          notes: item.notes
        }))
      }
    };

    //realizar um reduce para calcular o valor da retirada baseado na quantidade e valor unitario dos items
    const valuePickingOrder = items.reduce<Decimal | undefined>(
      (total, item) => {
        if (!item.unitPrice) return undefined;

        const quantity = new Decimal(item.quantityToPick);
        const unitPrice = new Decimal(item.unitPrice);

        if (total === undefined) return quantity.times(unitPrice);

        return total.plus(quantity.times(unitPrice));
      },
      new Decimal(0)
    );

    createInput.valuePickingOrder = valuePickingOrder;

    this.logger.log(`Criando o registro da ordem de separação no banco.`);
    const newOrder = await prisma.materialPickingOrder.create({
      data: createInput,
      include: {
        items: true
      }
    });
    this.logger.log(`Ordem de separação ${newOrder.id} criada.`);

    const orderInfoForMovement = {
      warehouseId: warehouse.id,
      processedByUserId: requestedByUser.id, // The user who requested is the one "processing" the reservation
      maintenanceRequestId: maintenanceRequest?.id,
      materialRequestId: materialRequest?.id
    };

    // vou comentar o código abaixo pois apenas o pedido de reserva não gera movimentação, é apenas uma intenção
    // a reserva efetiva do item será na atualização, quando do preenchimento de quantityPicked
    // nessa criação mexemos apenas em quantityToPick
    /*     this.logger.log(
      `Iniciando criação das movimentações de estoque (reserva)...`
    );
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
    ); */

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
      MaterialPickingOrderStatus.FULLY_WITHDRAWN,
      MaterialPickingOrderStatus.EXPIRED
      // Adicione outros status conforme necessário, ex: FULLY_WITHDRAWN
    ];
    if (uneditableStatuses.includes(existingOrder.status)) {
      throw new ConflictException(
        `Não é possível editar uma ordem de separação com status '${existingOrder.status}'.`
      );
    }

    const { items: itemsToUpdate } = data;

    //verificando consistencia entre quantidades solicitadas, reservadas e retiradas
    this._verifyQuantitiesConsistency(itemsToUpdate);

    // --- 3. VALIDAÇÃO DE QUANTIDADE (se aplicável) ---
    // Garante que a soma das reservas não exceda o solicitado na requisição de material.
    // Nessa verificação retorna um update do restrictionOrderItem da requisicao de material caso precise liberar itens restritos para reserva
    if (itemsToUpdate && existingOrder.materialRequest) {
      const updateItemsForRestrictionOrder =
        await this._canOrderPickingMaterialRequestAndNeedReleaseForPicked(
          existingOrder.materialRequest.id,
          itemsToUpdate,
          id // Passa o ID da ordem atual para ser ignorado na validação
        );

      //se tiver retorno, precisa liberar um ou mais itens das restrições
      //só deve fazer isso para a quantidade reservada e não intenção de reserva
      if (updateItemsForRestrictionOrder) {
        const restrictionOrder =
          await this.prisma.materialRestrictionOrder.findUnique({
            where: {
              targetMaterialRequestId: existingOrder.materialRequest.id
            },
            include: {
              items: true
            }
          });

        const updatesMap = new Map(
          updateItemsForRestrictionOrder.map((item) => [
            item.targetMaterialRequestItemId,
            item
          ])
        );

        //logica para sobrescrever os items que precisam ser mudados
        const mergedItems = restrictionOrder.items.map((item) => {
          const update = updatesMap.get(item.targetMaterialRequestItemId);
          return update ? { ...item, ...update } : item;
        });

        const updateRestrictionOrder: UpdateMaterialRestrictionOrderWithRelationsDto =
          {
            id: restrictionOrder.id,
            processedByUser: { id: data.proccessedByUser.id } as any,
            processedAt: new Date(),
            items: mergedItems
          };

        // atualizar a ordem de restricao para liberar os items necessarios para retirada
        await this.materialRestrictionOrdersService.update(
          restrictionOrder.id,
          updateRestrictionOrder,
          prisma as any
        );
      }
    }

    // verificar de forma geral no deposito se tem saldo para os items que vão estão sendo solicitados para reserva na atualização.
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
          const quantityDeltaToPick = new Decimal(
            updatedItem.quantityToPick || 0
          ).sub(existingItem.quantityToPick || 0);

          //só utiliza esse valor, pois é o único que afeta a movimentação, visto que não é possível editar items de reservas já retiradas.
          const quantityDeltaPicked = new Decimal(
            updatedItem.quantityPicked || 0
          ).sub(existingItem.quantityPicked || 0);

          const quantityDeltaWithdrawn = new Decimal(
            updatedItem.quantityToPick || 0
          ).sub(existingItem.quantityToPick || 0);

          if (!quantityDeltaPicked.isZero()) {
            await this._createStockMovement(prisma as any, {
              item: existingItem, // Use o item existente para ter todos os IDs
              quantityChange: quantityDeltaPicked,
              order: orderInfoForMovement,
              movementSubType: quantityDeltaPicked.isPositive()
                ? MaterialStockOperationSubType.RESERVE_FOR_PICKING_ORDER
                : MaterialStockOperationSubType.RELEASE_PICKING_RESERVATION
            });
          }
        } else {
          // --- É UM ITEM NOVO ---
          // A quantidade a ser movimentada é a própria quantidade do item.
          const quantityChange = new Decimal(updatedItem.quantityPicked || 0);
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
        if (!updatedItemKeys.has(key) && itemToDelete.quantityPicked) {
          await this._createStockMovement(prisma as any, {
            item: itemToDelete,
            quantityChange: itemToDelete.quantityPicked.negated(), // Devolve ao estoque
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
    if (data.proccessedByUser) {
      updatePayload.proccessedByUser = {
        connect: { id: data.proccessedByUser.id }
      };
    }
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
              quantityPicked: itemFromRequest.quantityPicked,
              quantityWithdrawn: itemFromRequest.quantityWithdrawn,
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
            quantityPicked: itemFromRequest.quantityPicked,
            quantityWithdrawn: itemFromRequest.quantityWithdrawn,
            notes: itemFromRequest.notes,
            globalMaterial: {
              connect: { id: itemFromRequest.globalMaterialId }
            },
            materialInstance: itemFromRequest.materialInstanceId
              ? { connect: { id: itemFromRequest.materialInstanceId } }
              : undefined,
            materialRequestItem: itemFromRequest.materialRequestItemId
              ? { connect: { id: itemFromRequest.materialRequestItemId } }
              : undefined,
            unitPrice: itemFromRequest.unitPrice
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
    // calcule apenas se o status não vir no corpo da requisição em "data"
    const newStatus =
      data.status ??
      (await this._calculatePickingOrderStatus(updatedOrderWithItems.items));

    await prisma.materialPickingOrder.update({
      where: { id },
      data: { status: newStatus }
    });

    const finalUpdatedOrder =
      await prisma.materialPickingOrder.findUniqueOrThrow({
        where: { id },
        include: this.includeRelations
      });

    if (newStatus === MaterialPickingOrderStatus.FULLY_WITHDRAWN) {
      await this._callMaterialWithdrawalLogicCreate(finalUpdatedOrder, prisma);

      this.logger.log(
        `Saída de material após atualização da reserva concluída com sucesso.`
      );
    }

    this.logger.log(`Ordem de separação ${id} atualizada com sucesso.`);

    // --- 8. RETORNAR A ORDEM COMPLETA E FINAL ---
    return finalUpdatedOrder;
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

  /**
   * Executa uma operação em massa em uma ordem de separação (Cancelar, Expirar, Retirar Tudo).
   * Este método serve como um atalho para modificar o estado e os itens de uma ordem de
   * separação de forma consistente, reutilizando a lógica de atualização principal.
   *
   * @param id - O ID da ordem de separação a ser modificada.
   * @param operatorId - O ID do usuário que está realizando a operação (para fins de auditoria).
   * @param operation - A operação a ser executada. Apenas `CANCELLED`, `EXPIRED`, e `FULLY_WITHDRAWN` são permitidas.
   * @returns A ordem de separação atualizada.
   * @throws {BadRequestException} se a operação for inválida.
   * @throws {NotFoundException} se a ordem de separação não for encontrada.
   * @throws {ConflictException} se a ordem já estiver em um estado final.
   */
  async operationInPickingOrder(
    id: number,
    operatorId: number,
    operation: MaterialPickingOrderStatus
  ): Promise<MaterialPickingOrderWithRelationsResponseDto> {
    const allowedOperations: MaterialPickingOrderStatus[] = [
      MaterialPickingOrderStatus.CANCELLED,
      MaterialPickingOrderStatus.EXPIRED,
      MaterialPickingOrderStatus.FULLY_WITHDRAWN,
      MaterialPickingOrderStatus.READY_FOR_PICKUP
    ];

    if (!allowedOperations.includes(operation)) {
      throw new BadRequestException(
        `A operação '${operation}' não é permitida. Operações válidas são: ${allowedOperations.join(
          ', '
        )}.`
      );
    }

    this.logger.log(
      `Iniciando operação '${operation}' na ordem de separação ID ${id} pelo operador ${operatorId}.`
    );

    const existingOrder =
      await this.prisma.materialPickingOrder.findUniqueOrThrow({
        where: { id },
        include: { items: true }
      });

    const updateDto: UpdateMaterialPickingOrderWithRelationsDto = {
      status: operation,
      proccessedByUser: { id: operatorId } as any,
      items: []
    };

    switch (operation) {
      case MaterialPickingOrderStatus.FULLY_WITHDRAWN:
        this.logger.debug(`Preparando payload para retirada total.`);
        updateDto.items = existingOrder.items.map((item) => ({
          ...item, // Mantém IDs e outras informações
          quantityPicked: new Decimal(0), // Libera qualquer reserva existente
          quantityWithdrawn: item.quantityToPick // Define a quantidade retirada como o total a ser separado
        }));
        break;

      case MaterialPickingOrderStatus.READY_FOR_PICKUP:
        this.logger.debug(`Preparando payload para reserva total.`);
        updateDto.items = existingOrder.items.map((item) => ({
          ...item, // Mantém IDs e outras informações
          //Não zere as quantidades solicitadas. Ela serve como lembrança do que foi pedido. É a logica implementada
          quantityPicked: item.quantityToPick // Define a quantidade separada para reserva como o total a ser separado
        }));
        break;

      case MaterialPickingOrderStatus.CANCELLED:
      case MaterialPickingOrderStatus.EXPIRED:
        this.logger.debug(`Preparando payload para cancelamento/expiração.`);
        updateDto.items = existingOrder.items.map((item) => ({
          ...item, // Mantém IDs e outras informações
          quantityPicked: new Decimal(0) // Libera qualquer reserva existente
          // quantityWithdrawn e quantityToPick não são alterados
        }));
        break;
    }

    // Reutiliza a lógica de atualização principal, que já lida com transações,
    // movimentações de estoque, e outras validações.
    return this.update(id, updateDto);
  }

  async listByWarehouse(
    warehouseId: number,
    queryParams?: {
      [key: string]: string;
    }
  ) {
    try {
      const whereArgs: Prisma.MaterialPickingOrderWhereInput = {
        warehouseId
      };

      if (!!Object.keys(queryParams).length) {
        const { startDate, endDate } = queryParams;
        if (startDate && endDate) {
          whereArgs.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
          };
        }
      }

      const findManyArgs: Prisma.MaterialPickingOrderFindManyArgs = {
        where: whereArgs,
        include: {
          warehouse: true,
          materialRequest: true,
          maintenanceRequest: {
            include: {
              facilityComplex: {
                select: {
                  name: true
                }
              },
              building: {
                select: {
                  name: true
                }
              }
            }
          },
          requestedByUser: true,
          beCollectedByUser: true,
          beCollectedByWorker: true,
          items: { include: { globalMaterial: true } }
        },
        orderBy: {
          createdAt: 'desc'
        }
      };

      return this.prisma.materialPickingOrder.findMany(findManyArgs);
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialPickingOrdersService', {
        operation: 'listByWarehouse'
      });
      throw error;
    }
  }
}
