import { MaterialRequest, Prisma } from '@sisman/prisma';
import { IMaterialGlobalCatalog } from '../global-catalog/material-global-catalog-types';

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
  items?: IMaterialGlobalCatalog[];
  itemsBalance: IItemMaterialRequestBalance[];
}

export interface IItemMaterialRequestBalance {
  globalMaterialId: string;
  materialRequestItemId: number;
  name: string;
  description: string;
  unitOfMeasure: string;
  quantityRequested: number;
  quantityApproved: number;
  quantityReceivedSum: number;
  quantityWithdrawnSum: number;
  quantityReserved: number;
  quantityRestricted: number;
  quantityFreeBalanceEffective: number;
  quantityFreeBalancePotential: number;
  unitPrice: number;
}
