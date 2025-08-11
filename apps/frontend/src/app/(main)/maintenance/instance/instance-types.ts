import { MaintenanceInstance, Prisma } from '@sisman/prisma';

export type IInstanceWithRelations = Prisma.MaintenanceInstanceGetPayload<{
  include: {currentMaintenanceRequests:true,timelineEventsTransferredFrom:true,timelineEventsTransferredTo:true,warehouses:true,InfrastructureBuilding:true,InfrastructureFacilityComplex:true,users:true}
}>;

export interface IInstanceAdd extends Omit<Prisma.MaintenanceInstanceCreateInput, 
  'currentMaintenanceRequests' | 'timelineEventsTransferredFrom' | 'timelineEventsTransferredTo' | 'warehouses' | 'InfrastructureBuilding' | 'InfrastructureFacilityComplex' | 'users'
> {}

export interface IInstanceEdit extends IInstanceAdd {
  id: number;
}

export type IInstance = MaintenanceInstance;

export type IInstanceRemove = {
  id: number;
};

export type IInstanceSelect = Prisma.MaintenanceInstanceSelect;

export type IInstanceRelatedData = {
  // Will be added later
};
