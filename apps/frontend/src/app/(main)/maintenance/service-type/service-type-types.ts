import { MaintenanceServiceType, Prisma } from '@sisman/prisma';

export type IServiceTypeWithRelations = Prisma.MaintenanceServiceTypeGetPayload<{
  include: {maintenanceRequests:true}
}>;

export interface IServiceTypeAdd extends Omit<Prisma.MaintenanceServiceTypeCreateInput, 
  'maintenanceRequests'
> {}

export interface IServiceTypeEdit extends IServiceTypeAdd {
  id: number;
}

export type IServiceType = MaintenanceServiceType;

export type IServiceTypeRemove = {
  id: number;
};

export type IServiceTypeSelect = Prisma.MaintenanceServiceTypeSelect;

export type IServiceTypeRelatedData = {
  // Will be added later
};
