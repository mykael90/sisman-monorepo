import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import {
  CreateMaintenanceRequestWithRelationsDto,
  UpdateMaintenanceRequestWithRelationsDto
} from './dto/maintenance-request.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import { FacilityComplexType, Prisma } from '@sisman/prisma';
import { InfrastructureBuildingsService } from '../infrastructure-buildings/infrastructure-buildings.service';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';

// Interface para o resultado de cada requisição no retorno
export interface MaintenanceRequestDeficitStatus {
  id: number;
  description: string;
  protocolNumber: string;
  sipacUserLoginRequest: string;
  loginsResponsibles?: string[];
  completedAt: Date;
  requestedAt: Date;
  updatedAt: Date;
  hasEffectiveDeficit: boolean;
  hasPotentialDeficit: boolean;
  deficitDetails?: Array<{
    globalMaterialId: string;
    name: string;
    unitOfMeasure: string;
    quantityRequestedSum: Prisma.Decimal;
    quantityReceivedSum: Prisma.Decimal;
    quantityWithdrawnSum: Prisma.Decimal;
    effectiveBalance: Prisma.Decimal;
    potentialBalance: Prisma.Decimal;
    unitPrice: Prisma.Decimal;
  }>;
}

// Interface para o retorno paginado
export interface PaginatedMaintenanceRequestDeficit {
  data: MaintenanceRequestDeficitStatus[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}
@Injectable()
export class MaintenanceRequestsService {
  private readonly logger = new Logger(MaintenanceRequestsService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly infrastructureBuildingsService: InfrastructureBuildingsService
  ) {}

  async create(data: CreateMaintenanceRequestWithRelationsDto): Promise<any> {
    //Include other fields based on building ID
    const otherFields = await this.includeOtherFields(data.building);
    if (!data.facilityComplex && otherFields.facilityComplex) {
      data.facilityComplex = otherFields.facilityComplex;
    }
    if (
      !data.currentMaintenanceInstance &&
      otherFields.currentMaintenanceInstance
    ) {
      data.currentMaintenanceInstance = otherFields.currentMaintenanceInstance;
    }

    // Ensure currentMaintenanceInstance is set to a default value if not provided
    if (!data.currentMaintenanceInstance) {
      data.currentMaintenanceInstance = {
        id: 1 // Default value
      };
    }

    // Destructure data to separate relations and other fields
    const {
      currentMaintenanceInstance,
      createdBy,
      assignedTo,
      space,
      building,
      facilityComplex,
      system,
      // equipment: _, // não será implementado esse model de equipment nesse projeto de pesquisa => TODO: futuro
      serviceType,
      statuses,
      diagnosis,
      timelineEvents, //não utiliza
      materialRequests,
      sipacUnitCost,
      sipacUnitRequesting,
      // originatingOccurrences is a reverse relation, cannot be created/updated directly here
      ...restOfData
    } = data;

    // Validate mandatory relations for connect-only
    // if (!currentMaintenanceInstance || !currentMaintenanceInstance.id) {
    //   throw new Error(
    //     'A instância de manutenção atual (currentMaintenanceInstance.id) é obrigatória para conectar.'
    //   );
    // }
    // if (!createdBy || !createdBy.id) {
    //   throw new Error(
    //     'O usuário criador (createdBy.id) é obrigatório para conectar.'
    //   );
    // }
    // if (!statuses || !statuses.status) {
    //   throw new Error(
    //     'O status da requisição (status.status) é obrigatório para conectar.'
    //   );
    // }

    // Validate optional relations for connect-only
    if (assignedTo && !assignedTo.id) {
      throw new Error(
        'Se o objeto "assignedTo" é fornecido, seu "id" é obrigatório para conectar.'
      );
    }
    if (space && !space?.id) {
      throw new Error(
        'Se o objeto "space" é fornecido, seu "id" é obrigatório para conectar.'
      );
    }
    if (facilityComplex && !facilityComplex.id) {
      throw new Error(
        'Se o objeto "facilityComplex" é fornecido, seu "id" é obrigatório para conectar.'
      );
    }
    if (building && !building.id) {
      throw new Error(
        'Se o objeto "building" é fornecido, seu "id" é obrigatório para conectar.'
      );
    }
    if (system && !system.id) {
      throw new Error(
        'Se o objeto "system" é fornecido, seu "id" é obrigatório para conectar.'
      );
    }

    // if (equipment && !equipment.id) {
    //   throw new Error(
    //     'Se o objeto "equipment" é fornecido, seu "id" é obrigatório para conectar.'
    //   );
    // }

    if (serviceType && !serviceType.id) {
      throw new Error(
        'Se o objeto "serviceType" é fornecido, seu "id" é obrigatório para conectar.'
      );
    }
    if (diagnosis && !diagnosis.id) {
      throw new Error(
        'Se o objeto "diagnosis" é fornecido, seu "id" é obrigatório para conectar.'
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

    const createInput: Prisma.MaintenanceRequestCreateInput = {
      ...restOfData,
      currentMaintenanceInstance: currentMaintenanceInstance?.id
        ? {
            connect: { id: currentMaintenanceInstance.id }
          }
        : undefined,
      createdBy: createdBy?.id ? { connect: { id: createdBy.id } } : undefined,
      statuses: statuses?.status
        ? {
            create: {
              status: statuses.status,
              description: statuses.description,
              isFinal: statuses.isFinal
            }
          }
        : undefined,
      assignedTo: assignedTo?.id
        ? { connect: { id: assignedTo.id } }
        : undefined,
      space: space?.id ? { connect: { id: space.id } } : undefined,
      facilityComplex: facilityComplex?.id
        ? { connect: { id: facilityComplex.id } }
        : undefined,
      building: building?.id ? { connect: { id: building.id } } : undefined,
      system: system?.id ? { connect: { id: system.id } } : undefined,
      // equipment: equipment?.id ? { connect: { id: equipment.id } } : undefined,
      serviceType: serviceType?.id
        ? { connect: { id: serviceType.id } }
        : undefined,
      diagnosis: diagnosis?.id ? { connect: { id: diagnosis.id } } : undefined,
      // originatingOccurrences cannot be created/connected directly from MaintenanceRequest
      materialRequests: {
        connect: materialRequests?.map((materialRequest) => {
          if (materialRequest.id) {
            return { id: materialRequest.id };
          } else if (materialRequest.protocolNumber) {
            return { protocolNumber: materialRequest.protocolNumber };
          } else {
            throw new Error(
              'O objeto precisa conter a chave "id" ou "protocolNumber".'
            );
          }
        })
      },
      sipacUnitRequesting: sipacUnitRequesting?.id // Connect if sipacUnitRequesting and its id are provided
        ? { connect: { id: sipacUnitRequesting.id } }
        : undefined,
      sipacUnitCost: sipacUnitCost?.id // Connect if sipacUnitCost and its id are provided
        ? { connect: { id: sipacUnitCost.id } }
        : undefined
    };

    this.logger.warn('createInput:', createInput);

    try {
      const maintenanceRequest = await this.prisma.maintenanceRequest.create({
        data: createInput,
        include: {
          currentMaintenanceInstance: true,
          createdBy: true,
          assignedTo: true,
          facilityComplex: true,
          building: true,
          space: true,
          system: true,
          // equipment: true,
          serviceType: true,
          statuses: true,
          diagnosis: true,
          // originatingOccurrences: true, // Cannot include reverse relation directly
          timelineEvents: true,
          materialRequests: true,
          sipacUnitRequesting: true,
          sipacUnitCost: true
        }
      });
      return maintenanceRequest;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'create',
        data: createInput
      });
      throw error;
    }
  }

  async list() {
    try {
      const maintenanceRequests = await this.prisma.maintenanceRequest.findMany(
        {
          include: {
            currentMaintenanceInstance: true,
            createdBy: true,
            assignedTo: true,
            facilityComplex: true,
            building: true,
            space: true,
            system: true,
            // equipment: true,
            serviceType: true,
            statuses: true,
            diagnosis: true,
            // originatingOccurrences: true, // Cannot include reverse relation directly
            timelineEvents: true,
            materialRequests: true,
            sipacUnitRequesting: true,
            sipacUnitCost: true
          }
        }
      );
      return maintenanceRequests;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number) {
    try {
      const maintenanceRequest =
        await this.prisma.maintenanceRequest.findUnique({
          where: { id },
          include: {
            currentMaintenanceInstance: true,
            createdBy: true,
            assignedTo: true,
            facilityComplex: true,
            building: true,
            space: true,
            system: true,
            // equipment: true,
            serviceType: true,
            statuses: true,
            diagnosis: true,
            // originatingOccurrences: true, // Cannot include reverse relation directly
            timelineEvents: true,
            materialRequests: true,
            sipacUnitRequesting: true,
            sipacUnitCost: true
          }
        });
      if (!maintenanceRequest) {
        throw new NotFoundException(
          `MaintenanceRequest with ID ${id} not found`
        );
      }
      return maintenanceRequest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async showByProtocolNumber(protocolNumber: string) {
    try {
      const maintenanceRequest =
        await this.prisma.maintenanceRequest.findUnique({
          where: { protocolNumber },
          include: {
            currentMaintenanceInstance: true,
            createdBy: true,
            assignedTo: true,
            facilityComplex: true,
            building: true,
            space: true,
            system: true,
            // equipment: true,
            serviceType: true,
            statuses: true,
            diagnosis: true,
            // originatingOccurrences: true, // Cannot include reverse relation directly
            timelineEvents: true,
            materialRequests: true,
            sipacUnitRequesting: true,
            sipacUnitCost: true
          }
        });
      if (!maintenanceRequest) {
        throw new NotFoundException(
          `MaintenanceRequest with protocolNumber ${protocolNumber} not found`
        );
      }
      return maintenanceRequest;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'findByProtocolNumber',
        protocolNumber
      });
      throw error;
    }
  }

  async showBalanceMaterials(id: number) {
    try {
      // 1. Executamos todas as consultas em paralelo para máxima eficiência
      const [
        maintenanceRequest,
        aggregatedReceiveds,
        aggregatedWithdrawals,
        aggregatedRequesteds
      ] = await this.prisma.$transaction([
        // Consulta 1: Busca os dados principais da MaintenanceRequest e as relações simples
        this.prisma.maintenanceRequest.findUnique({
          where: { id },
          include: {
            building: true,
            materialRequests: {
              include: {
                items: true,
                materialReceipts: true,
                materialWithdrawals: true
              }
            }
          }
        }),

        // Consulta 2: Agrega os itens de materialReceipt
        this.prisma.materialReceiptItem.groupBy({
          by: ['materialId'],
          where: {
            // Filtra apenas os itens cujas retiradas pertencem à nossa MaintenanceRequest
            materialReceipt: {
              materialRequest: {
                maintenanceRequestId: id
              }
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
            // Filtra apenas os itens cujas retiradas pertencem à nossa MaintenanceRequest
            materialWithdrawal: {
              maintenanceRequestId: id
            }
          },
          _sum: {
            quantityWithdrawn: true
          }
        }),

        // Consulta 4: Agrega os itens de MaterialRequest
        this.prisma.materialRequestItem.groupBy({
          by: ['requestedGlobalMaterialId'],
          where: {
            // Filtra apenas os itens cujas retiradas pertencem à nossa MaintenanceRequest
            materialRequest: {
              maintenanceRequestId: id
            }
          },
          _sum: {
            quantityRequested: true
          }
        })
      ]);

      // ----------------------------------------------------------------------
      // PASSO 2: Retornar as informações globais dos materiais envolvidos na consulta
      // ----------------------------------------------------------------------

      // TODO; ggregatedRequesteds

      const materialGlobalIdMap = new Map<string, undefined>();
      aggregatedReceiveds.forEach((materialReceived) => {
        materialGlobalIdMap.set(materialReceived.materialId, undefined);
      });

      aggregatedWithdrawals.forEach((materialWithdrawn) => {
        materialGlobalIdMap.set(materialWithdrawn.globalMaterialId, undefined);
      });

      aggregatedRequesteds.forEach((materialWithdrawn) => {
        materialGlobalIdMap.set(
          materialWithdrawn.requestedGlobalMaterialId,
          undefined
        );
      });

      const warehouseId =
        maintenanceRequest.materialRequests[0]?.materialReceipts[0]
          ?.destinationWarehouseId ||
        maintenanceRequest.materialRequests[0]?.materialWithdrawals[0]
          ?.warehouseId;

      const items = await this.prisma.materialWarehouseStock.findMany({
        where: warehouseId
          ? {
              materialId: { in: Array.from(materialGlobalIdMap.keys()) },
              warehouseId
            }
          : {
              materialId: { in: Array.from(materialGlobalIdMap.keys()) }
            },
        include: {
          material: true
        }
      });

      // ----------------------------------------------------------------------
      // PASSO 3: Preparar os dados para cálculo com o tipo Decimal do Prisma
      // ----------------------------------------------------------------------

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

      const requestedMap = new Map<string, Prisma.Decimal>();
      aggregatedRequesteds.forEach((item) => {
        requestedMap.set(
          item.requestedGlobalMaterialId,
          item._sum.quantityRequested ?? new Prisma.Decimal(0)
        );
      });

      // ----------------------------------------------------------------------
      // PASSO 3: Calcular o `itemsBalance` usando a aritmética de Prisma.Decimal
      // ----------------------------------------------------------------------

      const itemsBalance = items.map((item) => {
        const globalMaterialId = item.materialId;

        const quantityReceivedSum =
          receivedMap.get(globalMaterialId) ?? new Prisma.Decimal(0);
        const quantityWithdrawnSum =
          withdrawnMap.get(globalMaterialId) ?? new Prisma.Decimal(0);
        const quantityRequestedSum =
          requestedMap.get(globalMaterialId) ?? new Prisma.Decimal(0);

        // Realizar os cálculos usando os métodos de Decimal.js (a API é a mesma)
        const effectiveBalance =
          quantityReceivedSum.minus(quantityWithdrawnSum);

        const potentialBalance =
          quantityRequestedSum.minus(quantityWithdrawnSum);

        // Montar o objeto de retorno, convertendo para número no final
        return {
          globalMaterialId,
          name: item.material.name,
          description: item.material.description,
          unitOfMeasure: item.material.unitOfMeasure,
          quantityRequestedSum: quantityRequestedSum,
          quantityReceivedSum: quantityReceivedSum,
          quantityWithdrawnSum: quantityWithdrawnSum,
          effectiveBalance: effectiveBalance,
          potentialBalance: potentialBalance,
          unitPrice: item.updatedCost ?? item.material.unitPrice
        };
      });

      // ----------------------------------------------------------------------
      // PASSO 4: Montar a resposta final completa
      // ----------------------------------------------------------------------

      const finalResult = {
        ...maintenanceRequest,
        // Formata os dados agregados para o formato final
        materialRequesteds: {
          items: aggregatedRequesteds.map((item) => ({
            requestedGlobalMaterialId: item.requestedGlobalMaterialId,
            quantityRequestedSum:
              item._sum.quantityRequested ?? new Prisma.Decimal(0)
          }))
        },
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
        // Adiciona o balanço calculado
        itemsBalance
      };

      return finalResult;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'showBalanceMaterials',
        id
      });
      throw error;
    }
  }

  async showBalanceMaterialsByProtocolNumber(protocolNumber: string) {
    // Obter id e chamar o metodo showBalance

    try {
      const id = await this.prisma.maintenanceRequest.findUnique({
        where: {
          protocolNumber
        },
        select: {
          id: true
        }
      });

      if (!id) {
        throw new NotFoundException(
          `Id não encontrado para o protocolo ${protocolNumber}`
        );
      }

      return this.showBalanceMaterials(id.id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: UpdateMaintenanceRequestWithRelationsDto) {
    const {
      currentMaintenanceInstance,
      createdBy,
      assignedTo,
      facilityComplex,
      building,
      space,
      system,
      // equipment: _, // não será implementado esse model de equipment nesse projeto de pesquisa => TODO: futuro
      serviceType,
      statuses,
      diagnosis,
      timelineEvents,
      materialRequests,
      sipacUnitCost,
      sipacUnitRequesting,
      // originatingOccurrences is a reverse relation, cannot be created/updated directly here
      ...restOfData
    } = data;

    this.logger.log(`data AQUIIIIIII!!! ${JSON.stringify(data, null, 2)}`);

    const updateInput: Prisma.MaintenanceRequestUpdateInput = {
      ...restOfData
    };

    // Handle currentMaintenanceInstance connection
    if (currentMaintenanceInstance !== undefined) {
      if (currentMaintenanceInstance === null) {
        // currentMaintenanceInstanceId is mandatory, cannot disconnect to null
        this.logger.warn(
          `Attempted to set mandatory currentMaintenanceInstance relation to null for MaintenanceRequest ID ${id}. This operation is ignored.`
        );
      } else if (currentMaintenanceInstance.id) {
        updateInput.currentMaintenanceInstance = {
          connect: { id: currentMaintenanceInstance.id }
        };
      } else {
        throw new Error(
          'Se o objeto "currentMaintenanceInstance" é fornecido para atualização, seu "id" é obrigatório para conectar.'
        );
      }
    }

    // Handle createdBy connection
    if (createdBy !== undefined) {
      if (createdBy === null) {
        // createdById is mandatory, cannot disconnect to null
        this.logger.warn(
          `Attempted to set mandatory createdBy relation to null for MaintenanceRequest ID ${id}. This operation is ignored.`
        );
      } else if (createdBy.id) {
        updateInput.createdBy = { connect: { id: createdBy.id } };
      } else {
        throw new Error(
          'Se o objeto "createdBy" é fornecido para atualização, seu "id" é obrigatório para conectar.'
        );
      }
    }

    // Handle status connection
    if (statuses !== undefined) {
      if (statuses === null) {
        // statusId is mandatory, cannot disconnect to null
        this.logger.warn(
          `Attempted to set mandatory status relation to null for MaintenanceRequest ID ${id}. This operation is ignored.`
        );
      } else if (statuses.status) {
        updateInput.statuses = {
          upsert: {
            where: {
              status_maintenanceRequestId_createdAt: {
                status: statuses.status,
                maintenanceRequestId: id,
                createdAt: statuses.createdAt ?? new Date()
              }
            },
            update: {
              status: statuses.status,
              isFinal: statuses.isFinal,
              order: statuses.order
            },
            create: {
              status: statuses.status,
              description: statuses.description,
              isFinal: statuses.isFinal,
              order: statuses.order
            }
          }
        } as any;
      } else {
        throw new Error(
          'Se o objeto "status" é fornecido para atualização, ele deve conter a propriedade "status".'
        );
      }
    }

    // Handle assignedTo (connect or disconnect)
    if (assignedTo === null) {
      updateInput.assignedTo = { disconnect: true };
    } else if (assignedTo?.id) {
      updateInput.assignedTo = { connect: { id: assignedTo.id } };
    } else if (assignedTo !== undefined) {
      throw new Error(
        'Se o objeto "assignedTo" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    // Handle space (connect or disconnect)
    if (space === null) {
      updateInput.space = { disconnect: true };
    } else if (space?.id) {
      updateInput.space = { connect: { id: space.id } };
    } else if (space !== undefined) {
      throw new Error(
        'Se o objeto "space" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    //Handle facilityComplex (connect or disconnect
    if (facilityComplex === null) {
      updateInput.facilityComplex = { disconnect: true };
    } else if (facilityComplex?.id) {
      updateInput.facilityComplex = { connect: { id: facilityComplex.id } };
    } else if (facilityComplex !== undefined) {
      throw new Error(
        'Se o objeto "facilityComplex" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    // Handle building (connect or disconnect)
    if (building === null) {
      updateInput.building = { disconnect: true };
    } else if (building?.id) {
      updateInput.building = { connect: { id: building.id } };
    } else if (building !== undefined) {
      throw new Error(
        'Se o objeto "building" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    // Handle system (connect or disconnect)
    if (system === null) {
      updateInput.system = { disconnect: true };
    } else if (system?.id) {
      updateInput.system = { connect: { id: system.id } };
    } else if (system !== undefined) {
      throw new Error(
        'Se o objeto "system" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    // Handle equipment (connect or disconnect)
    // if (equipment === null) {
    //   updateInput.equipment = { disconnect: true };
    // } else if (equipment?.id) {
    //   updateInput.equipment = { connect: { id: equipment.id } };
    // } else if (equipment !== undefined) {
    //   throw new Error(
    //     'Se o objeto "equipment" é fornecido para atualização, seu "id" é obrigatório para conectar.'
    //   );
    // }

    // Handle serviceType (connect or disconnect)
    if (serviceType === null) {
      updateInput.serviceType = { disconnect: true };
    } else if (serviceType?.id) {
      updateInput.serviceType = { connect: { id: serviceType.id } };
    } else if (serviceType !== undefined) {
      throw new Error(
        'Se o objeto "serviceType" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    // Handle diagnosis (connect or disconnect)
    if (diagnosis === null) {
      updateInput.diagnosis = { disconnect: true };
    } else if (diagnosis?.id) {
      updateInput.diagnosis = { connect: { id: diagnosis.id } };
    } else if (diagnosis !== undefined) {
      throw new Error(
        'Se o objeto "diagnosis" é fornecido para atualização, seu "id" é obrigatório para conectar.'
      );
    }

    // originatingOccurrences is a reverse relation, cannot be updated directly here
    // if (originatingOccurrences !== undefined) {
    //   updateInput.originatingOccurrences = {
    //     set: originatingOccurrences.map((occurrence) => ({ id: occurrence.id }))
    //   };
    // }

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

    if (timelineEvents) {
      updateInput.timelineEvents = {
        upsert: timelineEvents.map((event) => {
          const { id: eventId, ...eventData } = event;
          return {
            where: { id: eventId || 0 }, // Use 0 or a specific strategy for new events without ID
            create: {
              ...eventData
            },
            update: {
              ...eventData
            }
          };
        })
      };
    }

    try {
      const updated = await this.prisma.maintenanceRequest.update({
        where: { id },
        data: updateInput,
        include: {
          currentMaintenanceInstance: true,
          createdBy: true,
          assignedTo: true,
          facilityComplex: true,
          building: true,
          space: true,
          system: true,
          // equipment: true,
          serviceType: true,
          statuses: true,
          diagnosis: true,
          // originatingOccurrences: true, // Cannot include reverse relation directly
          timelineEvents: true,
          materialRequests: true,
          sipacUnitRequesting: true,
          sipacUnitCost: true
        }
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'update',
        id,
        data: updateInput
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      // Consider implications of deleting related records (e.g., timelineEvents, originatingOccurrences)
      // Prisma can be configured for cascading deletes, or you might need to delete them manually in a transaction.
      const deleted = await this.prisma.maintenanceRequest.delete({
        where: { id }
      });
      return {
        message: 'Maintenance request deleted successfully',
        id: deleted.id
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }

  private async includeOtherFields(
    building: CreateMaintenanceRequestWithRelationsDto['building']
  ): Promise<
    Partial<{
      facilityComplex: CreateMaintenanceRequestWithRelationsDto['facilityComplex'];
      currentMaintenanceInstance: CreateMaintenanceRequestWithRelationsDto['currentMaintenanceInstance'];
    }>
  > {
    if (!building?.id) {
      this.logger.warn('Building ID is required to include other fields.');
      return {};
    }
    // Assuming building.id is the ID of the infrastructure building

    try {
      const buildingFromDb = await this.infrastructureBuildingsService.show(
        building.id
      );

      if (!buildingFromDb) {
        this.logger.warn(`Building with ID ${building.id} not found.`);
        return {};
      }

      const result: Partial<{
        facilityComplex: CreateMaintenanceRequestWithRelationsDto['facilityComplex'];
        currentMaintenanceInstance: CreateMaintenanceRequestWithRelationsDto['currentMaintenanceInstance'];
      }> = {};

      if (buildingFromDb.facilityComplexId) {
        result.facilityComplex = { id: buildingFromDb.facilityComplexId };
      }

      if (buildingFromDb.maintenanceInstanceId) {
        result.currentMaintenanceInstance = {
          id: buildingFromDb.maintenanceInstanceId
        };
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error including other fields for building ID ${building.id}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Retorna uma lista paginada de Requisições de Manutenção,
   * indicando se cada uma possui déficit efetivo ou potencial de materiais.
   *
   * @param pageIndex O número da página (padrão: 0).
   * @param pageSize O número de itens por página (padrão: 10).
   * @returns Uma lista paginada de MaintenanceRequestDeficitStatus.
   */
  async getPaginatedMaintenanceRequestsDeficit(
    pageIndex = 0,
    pageSize = 10
  ): Promise<PaginatedMaintenanceRequestDeficit> {
    try {
      const skip = pageIndex * pageSize;

      // PASSO 1: Obter o total de requisições e os dados básicos para a página atual
      const [totalMaintenanceRequests, maintenanceRequestsOnPage] =
        await this.prisma.$transaction([
          this.prisma.maintenanceRequest.count(),
          this.prisma.maintenanceRequest.findMany({
            select: {
              id: true,
              description: true,
              protocolNumber: true,
              updatedAt: true,
              sipacUserLoginRequest: true,
              completedAt: true,
              requestedAt: true
            }, // Selecionar apenas campos leves
            skip,
            take: pageSize,
            orderBy: { id: 'desc' } // Ordenação mais comum
          })
        ]);

      if (maintenanceRequestsOnPage.length === 0) {
        return {
          data: [],
          meta: {
            total: totalMaintenanceRequests,
            page: pageIndex,
            limit: pageSize,
            lastPage: Math.ceil(totalMaintenanceRequests / pageSize) - 1
          }
        };
      }

      const maintenanceRequestIds = maintenanceRequestsOnPage.map(
        (mr) => mr.id
      );

      // PASSO 2: Buscar todos os itens relacionados ao lote de requisições
      const [receiptItems, withdrawalItems, requestItems] =
        await this.prisma.$transaction([
          // Itens Recebidos
          this.prisma.materialReceiptItem.findMany({
            where: {
              materialReceipt: {
                materialRequest: {
                  maintenanceRequestId: { in: maintenanceRequestIds }
                }
              }
            },
            select: {
              materialId: true,
              quantityReceived: true,
              updatedAt: true,
              materialReceipt: {
                select: {
                  materialRequest: {
                    select: {
                      maintenanceRequestId: true
                    }
                  }
                }
              }
            }
          }),
          // Itens Retirados
          this.prisma.materialWithdrawalItem.findMany({
            where: {
              materialWithdrawal: {
                maintenanceRequestId: { in: maintenanceRequestIds }
              }
            },
            select: {
              globalMaterialId: true,
              quantityWithdrawn: true,
              materialWithdrawal: { select: { maintenanceRequestId: true } }
            }
          }),
          // Itens Solicitados
          this.prisma.materialRequestItem.findMany({
            where: {
              materialRequest: {
                maintenanceRequestId: { in: maintenanceRequestIds }
              }
            },
            select: {
              requestedGlobalMaterialId: true,
              quantityRequested: true,
              materialRequest: { select: { maintenanceRequestId: true } }
            }
          })
        ]);

      // PASSO 3: Coletar todos os IDs de materiais únicos para buscar seus nomes
      const allMaterialIds = new Set<string>();
      receiptItems.forEach((item) => allMaterialIds.add(item.materialId));
      withdrawalItems.forEach((item) =>
        allMaterialIds.add(item.globalMaterialId)
      );
      requestItems.forEach((item) =>
        allMaterialIds.add(item.requestedGlobalMaterialId)
      );

      const materialInfo = await this.prisma.materialGlobalCatalog.findMany({
        where: { id: { in: Array.from(allMaterialIds) } },
        select: { id: true, name: true, unitOfMeasure: true, unitPrice: true }
      });

      const materialInfoMap = new Map<string, (typeof materialInfo)[0]>();
      materialInfo.forEach((mat) => materialInfoMap.set(mat.id, mat));

      // PASSO 4: Estruturar os dados e calcular os balanços em memória
      const balanceByMaintenanceRequest = new Map<
        number,
        Map<
          string,
          {
            received: Prisma.Decimal;
            withdrawn: Prisma.Decimal;
            requested: Prisma.Decimal;
          }
        >
      >();

      // Agrupar recebidos
      for (const item of receiptItems) {
        const mrId = item.materialReceipt.materialRequest.maintenanceRequestId;
        if (!balanceByMaintenanceRequest.has(mrId)) {
          balanceByMaintenanceRequest.set(mrId, new Map());
        }
        const materialBalances = balanceByMaintenanceRequest.get(mrId);
        if (!materialBalances.has(item.materialId)) {
          materialBalances.set(item.materialId, {
            received: new Prisma.Decimal(0),
            withdrawn: new Prisma.Decimal(0),
            requested: new Prisma.Decimal(0)
          });
        }
        const current = materialBalances.get(item.materialId);
        current.received = current.received.plus(item.quantityReceived ?? 0);
      }

      // Agrupar retirados
      for (const item of withdrawalItems) {
        const mrId = item.materialWithdrawal.maintenanceRequestId;
        if (!balanceByMaintenanceRequest.has(mrId)) {
          balanceByMaintenanceRequest.set(mrId, new Map());
        }
        const materialBalances = balanceByMaintenanceRequest.get(mrId);
        if (!materialBalances.has(item.globalMaterialId)) {
          materialBalances.set(item.globalMaterialId, {
            received: new Prisma.Decimal(0),
            withdrawn: new Prisma.Decimal(0),
            requested: new Prisma.Decimal(0)
          });
        }
        const current = materialBalances.get(item.globalMaterialId);
        current.withdrawn = current.withdrawn.plus(item.quantityWithdrawn ?? 0);
      }

      // Agrupar solicitados
      for (const item of requestItems) {
        const mrId = item.materialRequest.maintenanceRequestId;
        if (!balanceByMaintenanceRequest.has(mrId)) {
          balanceByMaintenanceRequest.set(mrId, new Map());
        }
        const materialBalances = balanceByMaintenanceRequest.get(mrId);
        if (!materialBalances.has(item.requestedGlobalMaterialId)) {
          materialBalances.set(item.requestedGlobalMaterialId, {
            received: new Prisma.Decimal(0),
            withdrawn: new Prisma.Decimal(0),
            requested: new Prisma.Decimal(0)
          });
        }
        const current = materialBalances.get(item.requestedGlobalMaterialId);
        current.requested = current.requested.plus(item.quantityRequested ?? 0);
      }

      // PASSO 5: Montar a resposta final
      const resultData: MaintenanceRequestDeficitStatus[] =
        maintenanceRequestsOnPage.map((mr) => {
          let hasEffectiveDeficit = false;
          let hasPotentialDeficit = false;

          const deficitDetails: MaintenanceRequestDeficitStatus['deficitDetails'] =
            [];

          const materialBalances = balanceByMaintenanceRequest.get(mr.id);
          if (materialBalances) {
            for (const [
              globalMaterialId,
              balances
            ] of materialBalances.entries()) {
              const effectiveBalance = balances.received.minus(
                balances.withdrawn
              );
              const potentialBalance = balances.requested.minus(
                balances.withdrawn
              );

              if (effectiveBalance.isNegative()) {
                hasEffectiveDeficit = true;
              }
              if (potentialBalance.isNegative()) {
                hasPotentialDeficit = true;
              }

              if (
                effectiveBalance.isNegative() ||
                potentialBalance.isNegative()
              ) {
                deficitDetails.push({
                  globalMaterialId,
                  name:
                    materialInfoMap.get(globalMaterialId).name ||
                    'Material Desconhecido',
                  unitOfMeasure:
                    materialInfoMap.get(globalMaterialId).unitOfMeasure ||
                    'Unidade Desconhecida',
                  quantityRequestedSum: balances.requested,
                  quantityReceivedSum: balances.received,
                  quantityWithdrawnSum: balances.withdrawn,
                  effectiveBalance,
                  potentialBalance,
                  unitPrice: materialInfoMap.get(globalMaterialId).unitPrice
                });
              }
            }
          }

          return {
            id: mr.id,
            description: mr.description,
            requestedAt: mr.requestedAt,
            protocolNumber: mr.protocolNumber,
            completedAt: mr.completedAt,
            updatedAt: mr.updatedAt,
            sipacUserLoginRequest: mr.sipacUserLoginRequest,
            hasEffectiveDeficit,
            hasPotentialDeficit,
            deficitDetails:
              deficitDetails.length > 0 ? deficitDetails : undefined
          };
        });

      return {
        data: resultData,
        meta: {
          total: totalMaintenanceRequests,
          page: pageIndex,
          limit: pageSize,
          lastPage: Math.ceil(totalMaintenanceRequests / pageSize) - 1
        }
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'getPaginatedMaintenanceRequestsDeficit',
        params: { page: pageIndex, limit: pageSize } // Passando parâmetros de forma explícita
      });
      throw error; // Re-lança o erro para ser tratado pelo error handler global do NestJS
    }
  }

  /**
   * Retorna uma lista completa de Requisições de Manutenção,
   * indicando se cada uma possui déficit efetivo ou potencial de materiais.
   * Esta operação pode ser demorada, pois retorna todos os valores.
   *
   * @returns Uma lista de MaintenanceRequestDeficitStatus.
   */
  async getMaintenanceRequestsDeficitByMaintenanceInstance(
    maintenanceInstanceId: number,
    queryParams?: {
      [key: string]: string;
    }
  ): Promise<MaintenanceRequestDeficitStatus[]> {
    try {
      const whereArgs: Prisma.MaintenanceRequestWhereInput = {
        currentMaintenanceInstanceId: maintenanceInstanceId
      };

      //se a requisicao de manutencao esta com a flag usar sobras, não precisa exibir. não é considerado defict.
      whereArgs.useResidueMaterial = false;

      if (queryParams && !!Object.keys(queryParams).length) {
        const { startDate, endDate } = queryParams;
        if (startDate && endDate) {
          whereArgs.requestedAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
          };
        }
      }

      // PASSO 1: Obter todos os dados básicos das requisições
      const maintenanceRequests = await this.prisma.maintenanceRequest.findMany(
        {
          select: {
            id: true,
            description: true,
            protocolNumber: true,
            sipacUserLoginRequest: true,
            completedAt: true,
            updatedAt: true,
            requestedAt: true,
            materialWithdrawals: {
              select: { authorizedByUser: { select: { login: true } } }
            }
          }, // Selecionar apenas campos leves
          where: whereArgs,
          orderBy: { id: 'desc' } // Ordenação mais comum
        }
      );

      if (maintenanceRequests.length === 0) {
        return [];
      }

      const maintenanceRequestIds = maintenanceRequests.map((mr) => mr.id);

      // PASSO 2: Buscar todos os itens relacionados ao lote de requisições
      const [receiptItems, withdrawalItems, requestItems] =
        await this.prisma.$transaction([
          // Itens Recebidos
          this.prisma.materialReceiptItem.findMany({
            where: {
              materialReceipt: {
                materialRequest: {
                  maintenanceRequestId: { in: maintenanceRequestIds }
                }
              }
            },
            select: {
              materialId: true,
              quantityReceived: true,
              materialReceipt: {
                select: {
                  materialRequest: {
                    select: {
                      maintenanceRequestId: true
                    }
                  }
                }
              }
            }
          }),
          // Itens Retirados
          this.prisma.materialWithdrawalItem.findMany({
            where: {
              materialWithdrawal: {
                maintenanceRequestId: { in: maintenanceRequestIds }
              }
            },
            select: {
              globalMaterialId: true,
              quantityWithdrawn: true,
              materialWithdrawal: { select: { maintenanceRequestId: true } }
            }
          }),
          // Itens Solicitados
          this.prisma.materialRequestItem.findMany({
            where: {
              materialRequest: {
                maintenanceRequestId: { in: maintenanceRequestIds }
              }
            },
            select: {
              requestedGlobalMaterialId: true,
              quantityRequested: true,
              materialRequest: { select: { maintenanceRequestId: true } }
            }
          })
        ]);

      // PASSO 3: Coletar todos os IDs de materiais únicos para buscar seus nomes
      const allMaterialIds = new Set<string>();
      receiptItems.forEach((item) => allMaterialIds.add(item.materialId));
      withdrawalItems.forEach((item) =>
        allMaterialIds.add(item.globalMaterialId)
      );
      requestItems.forEach((item) =>
        allMaterialIds.add(item.requestedGlobalMaterialId)
      );

      const materialInfo = await this.prisma.materialGlobalCatalog.findMany({
        where: { id: { in: Array.from(allMaterialIds) } },
        select: { id: true, name: true, unitOfMeasure: true, unitPrice: true }
      });

      const materialInfoMap = new Map<string, (typeof materialInfo)[0]>();
      materialInfo.forEach((mat) => materialInfoMap.set(mat.id, mat));

      // PASSO 4: Estruturar os dados e calcular os balanços em memória
      const balanceByMaintenanceRequest = new Map<
        number,
        Map<
          string,
          {
            received: Prisma.Decimal;
            withdrawn: Prisma.Decimal;
            requested: Prisma.Decimal;
          }
        >
      >();

      // Agrupar recebidos
      for (const item of receiptItems) {
        const mrId = item.materialReceipt.materialRequest.maintenanceRequestId;
        if (!balanceByMaintenanceRequest.has(mrId)) {
          balanceByMaintenanceRequest.set(mrId, new Map());
        }
        const materialBalances = balanceByMaintenanceRequest.get(mrId);
        if (!materialBalances.has(item.materialId)) {
          materialBalances.set(item.materialId, {
            received: new Prisma.Decimal(0),
            withdrawn: new Prisma.Decimal(0),
            requested: new Prisma.Decimal(0)
          });
        }
        const current = materialBalances.get(item.materialId);
        current.received = current.received.plus(item.quantityReceived ?? 0);
      }

      // Agrupar retirados
      for (const item of withdrawalItems) {
        const mrId = item.materialWithdrawal.maintenanceRequestId;
        if (!balanceByMaintenanceRequest.has(mrId)) {
          balanceByMaintenanceRequest.set(mrId, new Map());
        }
        const materialBalances = balanceByMaintenanceRequest.get(mrId);
        if (!materialBalances.has(item.globalMaterialId)) {
          materialBalances.set(item.globalMaterialId, {
            received: new Prisma.Decimal(0),
            withdrawn: new Prisma.Decimal(0),
            requested: new Prisma.Decimal(0)
          });
        }
        const current = materialBalances.get(item.globalMaterialId);
        current.withdrawn = current.withdrawn.plus(item.quantityWithdrawn ?? 0);
      }

      // Agrupar solicitados
      for (const item of requestItems) {
        const mrId = item.materialRequest.maintenanceRequestId;
        if (!balanceByMaintenanceRequest.has(mrId)) {
          balanceByMaintenanceRequest.set(mrId, new Map());
        }
        const materialBalances = balanceByMaintenanceRequest.get(mrId);
        if (!materialBalances.has(item.requestedGlobalMaterialId)) {
          materialBalances.set(item.requestedGlobalMaterialId, {
            received: new Prisma.Decimal(0),
            withdrawn: new Prisma.Decimal(0),
            requested: new Prisma.Decimal(0)
          });
        }
        const current = materialBalances.get(item.requestedGlobalMaterialId);
        current.requested = current.requested.plus(item.quantityRequested ?? 0);
      }

      // PASSO 5: Montar a resposta final
      const resultData: MaintenanceRequestDeficitStatus[] =
        maintenanceRequests.map((mr) => {
          let hasEffectiveDeficit = false;
          let hasPotentialDeficit = false;

          const deficitDetails: MaintenanceRequestDeficitStatus['deficitDetails'] =
            [];

          const materialBalances = balanceByMaintenanceRequest.get(mr.id);
          if (materialBalances) {
            for (const [
              globalMaterialId,
              balances
            ] of materialBalances.entries()) {
              const effectiveBalance = balances.received.minus(
                balances.withdrawn
              );
              const potentialBalance = balances.requested.minus(
                balances.withdrawn
              );

              if (effectiveBalance.isNegative()) {
                hasEffectiveDeficit = true;
              }
              if (potentialBalance.isNegative()) {
                hasPotentialDeficit = true;
              }

              if (
                effectiveBalance.isNegative() ||
                potentialBalance.isNegative()
              ) {
                deficitDetails.push({
                  globalMaterialId,
                  name:
                    materialInfoMap.get(globalMaterialId)?.name ||
                    'Material Desconhecido',
                  unitOfMeasure:
                    materialInfoMap.get(globalMaterialId)?.unitOfMeasure ||
                    'Unidade Desconhecida',
                  quantityRequestedSum: balances.requested,
                  quantityReceivedSum: balances.received,
                  quantityWithdrawnSum: balances.withdrawn,
                  effectiveBalance,
                  potentialBalance,
                  unitPrice: materialInfoMap.get(globalMaterialId)?.unitPrice
                });
              }
            }
          }

          //responsaveis são os que fizeram autorizaram a retirada
          let loginsResponsibles = mr.materialWithdrawals.map(
            (order) => order.authorizedByUser.login
          );

          return {
            id: mr.id,
            description: mr.description,
            protocolNumber: mr.protocolNumber,
            sipacUserLoginRequest: mr.sipacUserLoginRequest,
            loginsResponsibles: loginsResponsibles,
            completedAt: mr.completedAt,
            requestedAt: mr.requestedAt,
            updatedAt: mr.updatedAt,
            hasEffectiveDeficit,
            hasPotentialDeficit,
            deficitDetails:
              deficitDetails.length > 0 ? deficitDetails : undefined
          };
        });

      return resultData;

      // Não é necessário. Todo o trabalho pesado ja foi feito no volume total de dados, deixe pra filtar no lado do cliente.
      // PASSO 6: Filtrar apenas requisicoes com deficit

      // return resultData.filter(
      //   (mr) => mr.hasEffectiveDeficit || mr.hasPotentialDeficit
      // );
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'getAllMaintenanceRequestsDeficit'
      });
      throw error; // Re-lança o erro para ser tratado pelo error handler global do NestJS
    }
  }
}
