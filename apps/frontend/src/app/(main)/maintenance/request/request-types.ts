import { MaintenanceRequest, Prisma } from '@sisman/prisma';

export type IRequestWithRelations = Prisma.MaintenanceRequestGetPayload<{
  include: {priorities:true,facilityComplex:true,building:true,space:true,system:true,currentMaintenanceInstance:true,createdBy:true,assignedTo:true,serviceType:true,statuses:true,diagnosis:true,timelineEvents:true,materialRequests:true,materialStockMovements:true,materialWithdrawals:true,materialPickingOrders:true,serviceOrders:true,sipacUnitRequesting:true,sipacUnitCost:true}
}>;

export interface IRequestAdd extends Omit<Prisma.MaintenanceRequestCreateInput, 
  'priorities' | 'facilityComplex' | 'building' | 'space' | 'system' | 'currentMaintenanceInstance' | 'createdBy' | 'assignedTo' | 'serviceType' | 'statuses' | 'diagnosis' | 'timelineEvents' | 'materialRequests' | 'materialStockMovements' | 'materialWithdrawals' | 'materialPickingOrders' | 'serviceOrders' | 'sipacUnitRequesting' | 'sipacUnitCost'
> {}

export interface IRequestEdit extends IRequestAdd {
  id: number;
}

export type IRequest = MaintenanceRequest;

export type IRequestRemove = {
  id: number;
};

export type IRequestSelect = Prisma.MaintenanceRequestSelect;

export type IRequestRelatedData = {
  // Will be added later
};
