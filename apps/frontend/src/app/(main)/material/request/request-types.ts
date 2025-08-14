import { MaterialRequest, Prisma } from '@sisman/prisma';

export type IMaterialRequestWithRelations = Prisma.MaterialRequestGetPayload<{
  include: { maintenanceRequest: true };
}>;

export interface IMaterialRequestAdd
  extends Omit<Prisma.MaterialRequestCreateInput, 'maintenanceRequest'> {}

export interface IRequestEdit extends IMaterialRequestAdd {
  id: number;
}

export type IMaterialRequest = MaterialRequest;

export type IMaterialRequestRemove = {
  id: number;
};

export type IMaterialRequestSelect = Prisma.MaterialRequestSelect;

export type IMaterialRequestRelatedData = {
  // Will be added later
};
