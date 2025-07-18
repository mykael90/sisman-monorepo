import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaintenanceRequestWithRelationsDto,
  UpdateMaintenanceRequestWithRelationsDto
} from './dto/maintenance-request.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import { Prisma } from '@sisman/prisma';

@Injectable()
export class MaintenanceRequestsService {
  private readonly logger = new Logger(MaintenanceRequestsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMaintenanceRequestWithRelationsDto): Promise<any> {
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

  async findByProtocolNumber(protocolNumber: string) {
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
      return maintenanceRequest;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceRequestsService', {
        operation: 'findByProtocolNumber',
        protocolNumber
      });
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
}
