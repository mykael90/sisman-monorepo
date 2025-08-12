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
