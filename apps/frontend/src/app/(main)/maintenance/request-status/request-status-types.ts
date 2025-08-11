import { MaintenanceRequestStatus, Prisma } from '@sisman/prisma';

export type IRequestStatusWithRelations = Prisma.MaintenanceRequestStatusGetPayload<{
  include: {maintenanceRequest:true}
}>;

export interface IRequestStatusAdd extends Omit<Prisma.MaintenanceRequestStatusCreateInput, 
  'maintenanceRequest'
> {}

export interface IRequestStatusEdit extends IRequestStatusAdd {
  id: number;
}

export type IRequestStatus = MaintenanceRequestStatus;

export type IRequestStatusRemove = {
  id: number;
};

export type IRequestStatusSelect = Prisma.MaintenanceRequestStatusSelect;

export type IRequestStatusRelatedData = {
  // Will be added later
};
