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

export interface IMaterialRequestBalanceWithRelations
  extends IMaterialRequestWithRelations {
  items: ItemMaterialRequestBalance[];
}

export interface ItemMaterialRequestBalance {
  id: number;
  materialRequestId: number;
  itemRequestType: 'GLOBAL_CATALOG' | string; // Pode ser mais específico se houver outros tipos
  requestedGlobalMaterialId: string;
  fulfilledByInstanceId: number | null;
  quantityRequested: string; // Pode ser string ou number, dependendo do uso
  quantityApproved: string;
  quantityDelivered: string;
  unitPrice: string;
  notes: string | null;
  createdAt: string; // Pode ser Date se for convertido
  updatedAt: string;
}
