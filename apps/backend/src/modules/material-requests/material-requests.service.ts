import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialRequestDto,
  CreateMaterialRequestWithRelationsDto,
  UpdateMaterialRequestWithRelationsDto
} from './dto/material-request.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import { Prisma } from '@sisman/prisma';

@Injectable()
export class MaterialRequestsService {
  private readonly logger = new Logger(MaterialRequestsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMaterialRequestWithRelationsDto): Promise<any> {
    const {
      warehouse,
      items,
      statusHistory,
      sipacUnitRequesting,
      sipacUnitCost,
      ...restOfData
    } = data;

    // Validate warehouse object if provided.
    // If the 'warehouse' object is part of the payload, its 'id' must be present for connection.
    // If the 'warehouse' object is not provided, Prisma will use 'warehouseId' from restOfData (which is mandatory in CreateMaterialRequestDto).
    if (warehouse && !warehouse.id) {
      throw new Error(
        'Se o objeto "warehouse" é fornecido, seu "id" é obrigatório para conectar.'
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
      warehouse: warehouse?.id // If warehouse object and its id are provided, connect using it.
        ? {
            connect: { id: warehouse.id }
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
      warehouse,
      items,
      statusHistory,
      sipacUnitRequesting,
      sipacUnitCost,
      ...restOfData
    } = data;

    // Validate warehouse object if provided for update
    if (warehouse && !warehouse.id) {
      throw new Error(
        'Se o objeto "warehouse" é fornecido para atualização, seu "id" é obrigatório para conectar.'
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

    // Handle warehouse connection
    if (warehouse !== undefined) {
      // warehouse object was explicitly passed
      if (warehouse === null) {
        // MaterialRequest.warehouseId is mandatory, so we cannot disconnect to null.
        // This state should ideally be prevented by validation or DTO constraints.
        // If warehouseId is in restOfData, it will be used.
        // If warehouse object is null, it implies an attempt to remove a mandatory relation.
        this.logger.warn(
          `Attempted to set mandatory warehouse relation to null for MaterialRequest ID ${id}. This operation is ignored if warehouseId is not being updated via scalar field.`
        );
      } else if (warehouse.id) {
        updateInput.warehouse = { connect: { id: warehouse.id } };
      }
      // Error for warehouse object without ID is already thrown above.
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
    //TODO: ver como vai ser essa atualização, ta duplicando no momento
    if (statusHistory) {
      // statusHistory array is provided (could be empty)
      updateInput.statusHistory = {
        upsert: statusHistory.map((status) => {
          const { id: statusId, ...statusData } = status; // statusId is MaterialRequestStatus's own ID
          return {
            where: { id: statusId || 0 }, // Assumes 0 is not a valid ID
            create: statusData,
            update: statusData
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
}
