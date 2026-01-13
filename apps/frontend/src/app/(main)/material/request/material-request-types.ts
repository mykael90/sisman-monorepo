import { MaterialRequest, Prisma } from '@sisman/prisma';
import { IMaterialGlobalCatalog } from '../global-catalog/material-global-catalog-types';

export type IMaterialRequestListWithRelations =
  Prisma.MaterialRequestGetPayload<{
    include: {
      items: { include: { requestedGlobalMaterial: true } };
      statusHistory: true;
      sipacUnitRequesting: true;
      sipacUnitCost: true;
      restrictionOrders: true;
      maintenanceRequest: {
        select: {
          id: true;
          protocolNumber: true;
          building: { select: { id: true; name: true } };
          updatedAt: true;
          createdAt: true;
          completedAt: true;
        };
      };
      materialPickingOrders: true;
      materialWithdrawals: true;
      materialReceipts: true;
      _count: {
        select: {
          materialPickingOrders: true;
          materialWithdrawals: true;
          materialReceipts: true;
        };
      };
    };
  }>;

export type IMaterialRequestShowWithRelations =
  Prisma.MaterialRequestGetPayload<{
    include: {
      items: { include: { requestedGlobalMaterial: true } };
      storage: { select: { id: true; name: true } };
      statusHistory: {
        orderBy: {
          changeDate: 'desc';
        };
      };
      sipacUnitRequesting: true;
      sipacUnitCost: true;
      restrictionOrders: {
        include: { items: true; processedByUser: true; warehouse: true };
      };
      maintenanceRequest: {
        select: {
          id: true;
          protocolNumber: true;
          building: { select: { id: true; name: true } };
          updatedAt: true;
          createdAt: true;
          completedAt: true;
        };
      };
      requestedBy: true; // Example: if you have a relation to User
      materialPickingOrders: {
        include: {
          items: { include: { globalMaterial: true } };
          requestedByUser: true;
          warehouse: true;
        };
      };
      materialWithdrawals: {
        include: {
          items: { include: { globalMaterial: true } };
          collectedByWorker: true;
          collectedByUser: true;
          processedByUser: true;
          warehouse: true;
          movementType: true;
          authorizedByUser: true;
        };
      };
      materialReceipts: {
        include: {
          items: { include: { material: true } };
          processedByUser: true;
          destinationWarehouse: true;
          movementType: true;
        };
      };
    };
  }>;

export interface IMaterialRequestAdd extends Omit<
  Prisma.MaterialRequestCreateInput,
  'maintenanceRequest'
> {}

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

export interface IMaterialRequestBalanceWithRelations extends IMaterialRequestListWithRelations {
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
