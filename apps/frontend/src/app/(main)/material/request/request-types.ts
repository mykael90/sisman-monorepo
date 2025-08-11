import { MaterialRequest, Prisma } from '@sisman/prisma';

export type IRequestWithRelations = Prisma.MaterialRequestGetPayload<{
  include: {maintenanceRequest:true}
}>;

export interface IRequestAdd extends Omit<Prisma.MaterialRequestCreateInput, 
  'maintenanceRequest'
> {}

export interface IRequestEdit extends IRequestAdd {
  id: number;
}

export type IRequest = MaterialRequest;

export type IRequestRemove = {
  id: number;
};

export type IRequestSelect = Prisma.MaterialRequestSelect;

export type IRequestRelatedData = {
  // Will be added later
};
