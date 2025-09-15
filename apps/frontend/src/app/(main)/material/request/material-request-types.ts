import { MaterialRequest, Prisma } from '@sisman/prisma';
import { IMaterialGlobalCatalog } from '../global-catalog/material-global-catalog-types';

export type IMaterialRequestWithRelations = Prisma.MaterialRequestGetPayload<{
  include: {
    maintenanceRequest: true;
    items: { include: { requestedGlobalMaterial: true } };
  };
}>;

export interface IMaterialRequestAdd
  extends Omit<Prisma.MaterialRequestCreateInput, 'maintenanceRequest'> {}

export interface IRequestEdit extends IMaterialRequestAdd {
  id: number;
}

export type IMaterialRequest = MaterialRequest;

export type IMaterialRequestItemWithRelations =
  Prisma.MaterialRequestItemGetPayload<{
    include: {
      requestedGlobalMaterial: true;
    };
  }>;

export type IMaterialRequestRemove = {
  id: number;
};

export type IMaterialRequestSelect = Prisma.MaterialRequestSelect;

export type IMaterialRequestRelatedData = {
  // Will be added later
};

export interface IMaterialRequestBalanceWithRelations
  extends IMaterialRequestWithRelations {
  itemsBalance: IItemMaterialRequestBalance[];
}

export interface IItemMaterialRequestBalance {
  globalMaterialId: string;
  materialRequestItemId: number;
  name: string;
  description: string;
  unitOfMeasure: string;
  quantityRequested: string;
  quantityApproved: string;
  quantityReceivedSum: string;
  quantityWithdrawnSum: string;
  quantityReserved: string;
  quantityRestricted: string;
  quantityFreeBalanceEffective: string;
  quantityFreeBalancePotential: string;
  quantityBalancePotential: string;
  unitPrice: string;
}
