import { MaintenanceRequest, Prisma } from '@sisman/prisma';

const dateFields = ['createdAt', 'updatedAt'];

export type IMaintenanceRequestWithRelations =
  Prisma.MaintenanceRequestGetPayload<{
    include: {
      facilityComplex: true;
      building: true;
      space: true;
      system: true;
      createdBy: true;
      assignedTo: true;
      serviceType: true;
      currentMaintenanceInstance: true;
      materialRequests: {
        include: { items: { include: { requestedGlobalMaterial: true } } };
      };
      sipacUnitRequesting: true;
    };
  }>;

export type IMaintenanceRequestShowWithRelations =
  Prisma.MaintenanceRequestGetPayload<{
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
            diagnosis: { include: { occurrence: true } },
            // originatingOccurrences: true, // Cannot include reverse relation directly
            timelineEvents: true,
            materialRequests: {
              include: {
                items: {
                  include: { requestedGlobalMaterial: true },
                  orderBy: {
                    requestedGlobalMaterial: {
                      name: 'asc'
                    }
                  }
                },
                materialReceipts: {
                  include: {
                    items: { include: { material: true } },
                    processedByUser: true,
                    destinationWarehouse: true,
                    movementType: true
                  }
                }
              },
              orderBy: {
                requestDate: 'desc'
              }
            },
            sipacUnitRequesting: true,
            sipacUnitCost: true,
            infrastructureNetwork: true,
            maintenanceContractOrders: true,
            materialPickingOrders: {
              include: {
                items: { include: { globalMaterial: true } },
                requestedByUser: true,
                warehouse: true
              }
            },
            materialWithdrawals: {
              include: {
                items: { include: { globalMaterial: true } },
                collectedByWorker: true,
                collectedByUser: true,
                processedByUser: true,
                warehouse: true,
                movementType: true,
                authorizedByUser: true
              }
            },
            priorities: true,
            serviceOrders: true
          }
    };
  }>;

export interface IMaintenanceRequestAdd {
  title: string;
  description?: string;
  deadline?: Date;
  facilityComplexId?: string;
  buildingId?: string;
  spaceId?: number;
  systemId?: number;
  local?: string;
  serviceTypeId?: number;
  assignedToId?: number;
}

export interface IMaintenanceRequestEdit extends IMaintenanceRequestAdd {
  id: number;
}

export type IMaintenanceRequest = MaintenanceRequest;

export type IMaintenanceRequestRemove = {
  id: number;
};

export type IMaintenanceRequestSelect = Prisma.MaintenanceRequestSelect;

export type IMaintenanceRequestRelatedData = {
  listFacilityComplexes: any[];
  listBuildings: any[];
  listSpaces: any[];
  listSystems: any[];
  listServiceTypes: any[];
  listUsers: any[];
  listMaintenanceInstances: any[];
};

export interface IMaintenanceRequestBalanceWithRelations extends IMaintenanceRequestWithRelations {
  itemsBalance: IItemMaintenanceRequestBalance[];
}

export interface IItemMaintenanceRequestBalance {
  globalMaterialId: string;
  name: string;
  description: string;
  unitOfMeasure: string;
  quantityRequestedSum: string;
  quantityReceivedSum: string;
  quantityWithdrawnSum: string;
  effectiveBalance: string;
  potentialBalance: string;
  unitPrice: string;
}

// Interface para o resultado de cada requisição no retorno
export interface IMaintenanceRequestDeficitStatus {
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
export interface IPaginatedMaintenanceRequestDeficit {
  data: IMaintenanceRequestDeficitStatus[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}
