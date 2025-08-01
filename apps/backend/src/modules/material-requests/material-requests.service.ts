import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialRequestWithRelationsDto,
  UpdateMaterialRequestWithRelationsDto
} from '@sisman/types';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  MaterialPickingOrderStatus,
  Prisma,
  RestrictionOrderStatus
} from '@sisman/prisma';
import { includes } from 'lodash';

// Definir uma interface para as opções de exclusão para clareza
export interface ShowBalanceOptions {
  pickingOrderIdToExclude?: number;
  withdrawalIdToExclude?: number;
  restrictionIdToExclude?: number;
}

//  Definir os tipos para a configuração da operação
type OperationType = 'RESERVATION' | 'WITHDRAWAL' | 'RESTRICTION';

type OperationConfig = {
  type: OperationType;
  balanceToCheck: 'potential' | 'effective';
  idToExclude?: ShowBalanceOptions; // Reutilizando a interface
};

@Injectable()
export class MaterialRequestsService {
  private readonly logger = new Logger(MaterialRequestsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMaterialRequestWithRelationsDto): Promise<any> {
    const {
      storage,
      items,
      statusHistory,
      sipacUnitRequesting,
      sipacUnitCost,
      ...restOfData
    } = data;

    // Validate storage object if provided.
    // If the 'storage' object is part of the payload, its 'id' must be present for connection.
    // If the 'storage' object is not provided, Prisma will use 'storageId' from restOfData (which is mandatory in CreateMaterialRequestDto).
    if (storage && !storage.id) {
      throw new Error(
        'Se o objeto "storage" é fornecido, seu "id" é obrigatório para conectar.'
      );
    }

    // Validate and prepare sipacUnitRequesting for connect-only
    if (sipacUnitRequesting && !sipacUnitRequesting.id) {
      throw new Error(
        'ID da unidade requisitante (sipacUnitRequesting.id) é obrigatório. Apenas conexão é permitida.'
      );
    }

    // Validate and prepare sipacUnitCost for connect-only
    if (sipacUnitCost && !sipacUnitCost.id) {
      throw new Error(
        'ID da unidade de custo (sipacUnitCost.id) é obrigatório. Apenas conexão é permitida.'
      );
    }

    const createInput: Prisma.MaterialRequestCreateInput = {
      ...restOfData,
      storage: storage?.id // If storage object and its id are provided, connect using it.
        ? {
            connect: { id: storage.id }
          }
        : undefined,
      items:
        items && items.length > 0
          ? {
              create: items.map((item) => ({
                ...item,
                quantityRequested: item.quantityRequested as Prisma.Decimal,
                ...(item.quantityApproved && {
                  quantityApproved: item.quantityApproved as Prisma.Decimal
                }),
                ...(item.quantityDelivered && {
                  quantityDelivered: item.quantityDelivered as Prisma.Decimal
                })
              }))
            }
          : undefined,
      statusHistory:
        statusHistory && statusHistory.length > 0
          ? {
              create: statusHistory.map((status) => ({
                ...status
              }))
            }
          : undefined,
      sipacUnitRequesting: sipacUnitRequesting?.id // Connect if sipacUnitRequesting and its id are provided
        ? { connect: { id: sipacUnitRequesting.id } }
        : undefined,
      sipacUnitCost: sipacUnitCost?.id // Connect if sipacUnitCost and its id are provided
        ? { connect: { id: sipacUnitCost.id } }
        : undefined
    };

    try {
      const materialRequest = await this.prisma.materialRequest.create({
        data: createInput,
        include: {
          // Optionally include relations in the response
          items: true,
          statusHistory: true,
          sipacUnitRequesting: true,
          sipacUnitCost: true
        }
      });
      return materialRequest;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'create',
        data: createInput // Log the transformed input
      });
      throw error;
    }
  }

  async list() {
    try {
      const materialRequests = await this.prisma.materialRequest.findMany({
        include: {
          items: true,
          statusHistory: true,
          sipacUnitRequesting: true,
          sipacUnitCost: true
        }
      });

      return materialRequests;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number) {
    try {
      const materialRequest = await this.prisma.materialRequest.findUnique({
        where: {
          id
        },
        include: {
          items: true,
          statusHistory: true,
          sipacUnitRequesting: true,
          sipacUnitCost: true,
          requestedBy: true, // Example: if you have a relation to User
          maintenanceRequest: true // Example: if you have a relation
        }
      });
      if (!materialRequest) {
        throw new NotFoundException(`MaterialRequest with ID ${id} not found`);
      }
      return materialRequest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }
  async showBalance(id: number, options?: ShowBalanceOptions) {
    try {
      // 1. Executamos todas as consultas em paralelo para máxima eficiência
      const [
        materialRequest,
        aggregatedReceiveds,
        aggregatedWithdrawals,
        aggregatedPickingOrders
      ] = await this.prisma.$transaction([
        // Consulta 1: Busca os dados principais da MaterialRequest e as relações simples
        this.prisma.materialRequest.findUnique({
          where: { id },
          include: {
            items: true,
            // Removemos as relações que vamos agregar manualmente
            // materialReceipts: { include: { items: true } },
            // materialWithdrawals: true,
            // materialPickingOrders: true,
            restrictionOrders: {
              include: { items: true },
              where: {
                status: { not: RestrictionOrderStatus.FREE },
                ...(options?.restrictionIdToExclude && {
                  id: {
                    not: options.restrictionIdToExclude
                  }
                })
              }
            }
          }
        }),

        // Consulta 2: Agrega os itens de materialReceipt
        this.prisma.materialReceiptItem.groupBy({
          by: ['materialId'],
          where: {
            // Filtra apenas os itens cujas retiradas pertencem à nossa MaterialRequest
            materialReceipt: {
              materialRequestId: id
            }
          },
          _sum: {
            quantityReceived: true
          }
        }),

        // Consulta 3: Agrega os itens de MaterialWithdrawal
        this.prisma.materialWithdrawalItem.groupBy({
          by: ['globalMaterialId'],
          where: {
            // Filtra apenas os itens cujas retiradas pertencem à nossa MaterialRequest
            materialWithdrawal: {
              materialRequestId: id
            }
          },
          _sum: {
            quantityWithdrawn: true
          }
        }),

        // Consulta 4: Agrega os itens de MaterialPickingOrder
        this.prisma.materialPickingOrderItem.groupBy({
          by: ['globalMaterialId'],
          where: {
            // Filtra apenas os itens cujas ordens de separação pertencem à nossa MaterialRequest
            materialPickingOrder: {
              materialRequestId: id,
              status: {
                in: [
                  MaterialPickingOrderStatus.IN_PREPARATION,
                  MaterialPickingOrderStatus.PARTIALLY_WITHDRAWN,
                  MaterialPickingOrderStatus.READY_FOR_PICKUP
                ]
              },
              ...(options?.pickingOrderIdToExclude && {
                id: {
                  not: options.pickingOrderIdToExclude
                }
              })
            }
          },
          _sum: { quantityPicked: true }
        })
      ]);

      // ----------------------------------------------------------------------
      // PASSO 2: Preparar os dados para cálculo com o tipo Decimal do Prisma
      // ----------------------------------------------------------------------

      // Função auxiliar usando Prisma.Decimal
      const createDecimalQuantityMap = (
        items: any[] | undefined,
        idKey: string,
        quantityKey: string
      ): Map<string, Prisma.Decimal> => {
        const map = new Map<string, Prisma.Decimal>();
        if (!items) return map;

        for (const item of items) {
          // A quantidade já é Prisma.Decimal | null. Usamos `new Prisma.Decimal(0)` se for nulo.
          const quantity = item[quantityKey] ?? new Prisma.Decimal(0);
          // Garantimos que estamos sempre trabalhando com uma instância de Prisma.Decimal
          map.set(item[idKey], new Prisma.Decimal(quantity));
        }
        return map;
      };

      const restrictedMap = createDecimalQuantityMap(
        materialRequest.restrictionOrders?.items,
        'globalMaterialId',
        'quantityRestricted'
      );

      const receivedMap = new Map<string, Prisma.Decimal>();
      aggregatedReceiveds.forEach((item) => {
        receivedMap.set(
          item.materialId,
          item._sum.quantityReceived ?? new Prisma.Decimal(0)
        );
      });

      const withdrawnMap = new Map<string, Prisma.Decimal>();
      aggregatedWithdrawals.forEach((item) => {
        withdrawnMap.set(
          item.globalMaterialId,
          item._sum.quantityWithdrawn ?? new Prisma.Decimal(0)
        );
      });

      const reservedMap = new Map<string, Prisma.Decimal>();
      aggregatedPickingOrders.forEach((item) => {
        reservedMap.set(
          item.globalMaterialId,
          item._sum.quantityPicked ?? new Prisma.Decimal(0)
        );
      });

      // ----------------------------------------------------------------------
      // PASSO 3: Calcular o `itemsBalance` usando a aritmética de Prisma.Decimal
      // ----------------------------------------------------------------------

      const itemsBalance = materialRequest.items.map((item) => {
        const globalMaterialId = item.requestedGlobalMaterialId;
        const materialRequestItemId = item.id;

        // Obter todas as quantidades como objetos Prisma.Decimal
        const quantityRequested =
          item.quantityRequested ?? new Prisma.Decimal(0);
        const quantityApproved = item.quantityApproved ?? new Prisma.Decimal(0);

        const quantityReceivedSum =
          receivedMap.get(globalMaterialId) ?? new Prisma.Decimal(0);
        const quantityWithdrawnSum =
          withdrawnMap.get(globalMaterialId) ?? new Prisma.Decimal(0);
        const quantityReserved =
          reservedMap.get(globalMaterialId) ?? new Prisma.Decimal(0);
        const quantityRestricted =
          restrictedMap.get(globalMaterialId) ?? new Prisma.Decimal(0);

        // Realizar os cálculos usando os métodos de Decimal.js (a API é a mesma)
        const quantityFreeBalanceEffective = quantityReceivedSum
          .minus(quantityWithdrawnSum)
          .minus(quantityReserved)
          .minus(quantityRestricted);

        const quantityFreeBalancePotential = quantityReceivedSum.equals(
          new Prisma.Decimal(0)
        )
          ? quantityRequested
              .minus(quantityWithdrawnSum)
              .minus(quantityReserved)
              .minus(quantityRestricted)
          : quantityFreeBalanceEffective;

        // Montar o objeto de retorno, convertendo para string no final
        return {
          globalMaterialId,
          materialRequestItemId,
          quantityRequested,
          quantityApproved,
          quantityReceivedSum,
          quantityWithdrawnSum,
          quantityReserved,
          quantityRestricted,
          quantityFreeBalanceEffective,
          quantityFreeBalancePotential
        };
      });

      // ----------------------------------------------------------------------
      // PASSO 4: Montar a resposta final completa
      // ----------------------------------------------------------------------

      const finalResult = {
        ...materialRequest,
        // Formata os dados agregados para o formato final
        materialReceipts: {
          items: aggregatedReceiveds.map((item) => ({
            globalMaterialId: item.materialId,
            quntityReceivedSum:
              item._sum.quantityReceived ?? new Prisma.Decimal(0)
          }))
        },
        materialWithdrawals: {
          items: aggregatedWithdrawals.map((item) => ({
            globalMaterialId: item.globalMaterialId,
            quantityWithdrawnSum:
              item._sum.quantityWithdrawn ?? new Prisma.Decimal(0)
          }))
        },
        materialPickingOrders: {
          items: aggregatedPickingOrders.map((item) => ({
            globalMaterialId: item.globalMaterialId,
            quantityPickedSum: item._sum.quantityPicked ?? new Prisma.Decimal(0)
          }))
        },
        // Adiciona o balanço calculado
        itemsBalance
      };

      return finalResult;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async findByProtocolNumber(protocolNumber: string) {
    try {
      const materialRequest = await this.prisma.materialRequest.findUnique({
        where: {
          protocolNumber
        },
        include: {
          // Optional: include relations if needed
          items: true,
          statusHistory: true
        }
      });
      // No NotFoundException here, as the method is often used to check existence.
      // The caller (e.g., RequisicoesMateriaisService) handles the null case.
      return materialRequest;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'findByProtocolNumber',
        protocolNumber
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateMaterialRequestWithRelationsDto) {
    const {
      storage,
      items,
      statusHistory,
      sipacUnitRequesting,
      sipacUnitCost,
      ...restOfData
    } = data;

    // Validate storage object if provided for update
    if (storage && !storage.id) {
      throw new Error(
        'Se o objeto "storage" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    // Validate and prepare sipacUnitRequesting for connect-only or disconnect
    if (sipacUnitRequesting && !sipacUnitRequesting.id) {
      throw new Error(
        'ID da unidade requisitante (sipacUnitRequesting.id) é obrigatório para atualização. Apenas conexão é permitida.'
      );
    }

    // Validate and prepare sipacUnitCost for connect-only or disconnect
    if (sipacUnitCost && !sipacUnitCost.id) {
      throw new Error(
        'ID da unidade de custo (sipacUnitCost.id) é obrigatório para atualização. Apenas conexão é permitida.'
      );
    }

    const updateInput: Prisma.MaterialRequestUpdateInput = {
      ...restOfData // Contains scalar fields
    };

    // Handle storage connection
    if (storage !== undefined) {
      // storage object was explicitly passed
      if (storage === null) {
        // MaterialRequest.storageId is mandatory, so we cannot disconnect to null.
        // This state should ideally be prevented by validation or DTO constraints.
        // If storageId is in restOfData, it will be used.
        // If storage object is null, it implies an attempt to remove a mandatory relation.
        this.logger.warn(
          `Attempted to set mandatory storage relation to null for MaterialRequest ID ${id}. This operation is ignored if storageId is not being updated via scalar field.`
        );
      } else if (storage.id) {
        updateInput.storage = { connect: { id: storage.id } };
      }
      // Error for storage object without ID is already thrown above.
    }

    // Handle sipacUnitRequesting (connect or disconnect)
    if (sipacUnitRequesting === null) {
      updateInput.sipacUnitRequesting = { disconnect: true };
    } else if (sipacUnitRequesting?.id) {
      updateInput.sipacUnitRequesting = {
        connect: { id: sipacUnitRequesting.id }
      };
    } // Error for object without ID already thrown

    // Handle sipacUnitCost (connect or disconnect)
    if (sipacUnitCost === null) {
      updateInput.sipacUnitCost = { disconnect: true };
    } else if (sipacUnitCost?.id) {
      updateInput.sipacUnitCost = { connect: { id: sipacUnitCost.id } };
    } // Error for object without ID already thrown

    // Handle items using upsert
    if (items) {
      // items array is provided (could be empty)
      updateInput.items = {
        upsert: items.map((item) => {
          // É mais claro usar o nome original do campo aqui.
          // O ID primário do item (se houver) não é necessário para a lógica do upsert
          // pois estamos usando a chave única composta para encontrar o registro.
          const { requestedGlobalMaterialId, ...itemData } = item;

          // Dados para CREATE e UPDATE
          const prismaItemData = {
            // Precisamos garantir que o requestedGlobalMaterialId esteja nos dados
            // para a operação de criação (CREATE).
            requestedGlobalMaterialId: requestedGlobalMaterialId,
            ...itemData,
            quantityRequested: itemData.quantityRequested,
            ...(itemData.quantityApproved && {
              quantityApproved: itemData.quantityApproved
            }),
            ...(itemData.quantityDelivered && {
              quantityDelivered: itemData.quantityDelivered
            })
          };

          // Para a operação UPDATE, geralmente não se atualiza os campos da chave única.
          // Embora o Prisma seja inteligente, é uma boa prática remover a chave do payload de atualização.
          const { requestedGlobalMaterialId: _, ...updatePayload } =
            prismaItemData;

          return {
            // ✅ ESTA É A PARTE CORRIGIDA
            where: {
              // Usando o identificador único composto gerado pelo Prisma
              materialRequestId_requestedGlobalMaterialId: {
                materialRequestId: id, // O ID do MaterialRequest pai
                requestedGlobalMaterialId: requestedGlobalMaterialId // O ID do material do item
              }
            },
            // Dados a serem usados se o item for CRIADO
            create: prismaItemData,
            // Dados a serem usados se o item for ATUALIZADO
            update: updatePayload
          };
        })
      };
    }

    // Handle statusHistory using upsert
    if (statusHistory) {
      // statusHistory array is provided (could be empty)
      updateInput.statusHistory = {
        upsert: statusHistory.map((statusItem) => {
          // Para o upsert, o 'changeDate' é essencial para identificar o registro.
          // Se o cliente envia um status com um 'changeDate' que já existe para esta requisição, ele será atualizado.
          // Se 'changeDate' for omitido ou for novo, um novo registro de histórico será criado.
          const whereChangeDate = statusItem.changeDate
            ? new Date(statusItem.changeDate)
            : new Date();

          const createPayload = { ...statusItem, changeDate: whereChangeDate };
          // Na atualização, não se deve incluir os campos da chave primária.
          const { changeDate, status, ...updatePayload } = statusItem;

          return {
            where: {
              materialRequestId_status_changeDate: {
                materialRequestId: id,
                changeDate: whereChangeDate,
                status: statusItem.status
              }
            },
            create: createPayload,
            update: updatePayload
          };
        })
      };
    }

    try {
      const updated = await this.prisma.materialRequest.update({
        where: {
          id
        },
        data: updateInput,
        include: {
          items: true,
          statusHistory: true,
          sipacUnitRequesting: true,
          sipacUnitCost: true
        }
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'update',
        id,
        data: updateInput
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      // Consider implications of deleting related records (e.g., items, statusHistory)
      // Prisma can be configured for cascading deletes, or you might need to delete them manually in a transaction.
      const deleted = await this.prisma.materialRequest.delete({
        where: {
          id
        }
      });
      return {
        message: 'Material request deleted successfully',
        id: deleted.id
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }

  // 2. O NOVO MÉTODO GENÉRICO
  //faz a validação antes de permitir uma operação de saída, reserva ou restrição
  // associada a uma requisição de material
  async validateOperationAgainstBalance(
    materialRequestId: number,
    itemsToVerify: Array<{
      materialRequestItemId: number;
      quantity: Prisma.Decimal;
    }>,
    config: OperationConfig
  ): Promise<void> {
    if (!itemsToVerify || itemsToVerify.length === 0) {
      return;
    }

    // Obter o balanço atual, aplicando as exclusões necessárias
    const balanceData = await this.showBalance(
      materialRequestId,
      config.idToExclude
    );

    // Mapear balanço para busca rápida
    const balanceMap = new Map(
      balanceData.itemsBalance.map((b) => [b.materialRequestItemId, b])
    );

    // Mapear os itens da requisição original para obter o `globalMaterialId` para os logs
    const materialRequestItemsMap = new Map(
      balanceData.items.map((item) => [item.id, item])
    );

    // Definir textos para personalização das mensagens de erro
    const opTexts = {
      RESERVATION: { verb: 'reservar', noun: 'reserva' },
      WITHDRAWAL: { verb: 'retirar', noun: 'retirada' },
      RESTRICTION: { verb: 'restringir', noun: 'restrição' }
    }[config.type];

    for (const item of itemsToVerify) {
      const balanceItem = balanceMap.get(item.materialRequestItemId);
      if (!balanceItem) {
        throw new BadRequestException(
          `Inconsistência: O item de requisição ID ${item.materialRequestItemId} não foi encontrado no balanço.`
        );
      }

      // Escolhe qual balanço usar para a validação
      const availableBalance =
        config.balanceToCheck === 'potential'
          ? new Prisma.Decimal(balanceItem.quantityFreeBalancePotential)
          : new Prisma.Decimal(balanceItem.quantityFreeBalanceEffective);

      const quantityToVerify = new Prisma.Decimal(item.quantity);

      // A validação principal
      if (quantityToVerify.greaterThan(availableBalance)) {
        const materialInfo = materialRequestItemsMap.get(
          item.materialRequestItemId
        );
        const materialId =
          materialInfo?.requestedGlobalMaterialId ?? 'desconhecido';

        throw new ConflictException(
          `Não é possível ${opTexts.verb} a quantidade ${quantityToVerify.toString()} para o material ${materialId}. ` +
            `A quantidade para esta ${opTexts.noun} excede o saldo disponível de ${availableBalance.toString()}.`
        );
      }
    }
  }
}
