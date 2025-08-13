import { MaterialGlobalCatalog, Prisma } from '@sisman/prisma';

export type IMaterialGlobalCatalogWithRelations =
  Prisma.MaterialGlobalCatalogGetPayload<{
    // No specific includes for now, similar to picking-order-types.ts initial state
  }>;

export interface IMaterialGlobalCatalogAdd
  extends Omit<
    Prisma.MaterialGlobalCatalogCreateInput,
    | 'warehouseStandardStocks'
    | 'materialsDerived'
    | 'materialRequestItems'
    | 'materialStockMovements'
    | 'materialStockTransferOrderItems'
    | 'materialWithdrawalItems'
    | 'materialReceiptItems'
    | 'materialRestrictionOrderItems'
    | 'materialPickingOrderItems'
    | 'createdAt'
    | 'updatedAt'
  > {}

export interface IMaterialGlobalCatalogEdit extends IMaterialGlobalCatalogAdd {
  id: string; // MaterialGlobalCatalog has string id
}

export type IMaterialGlobalCatalog = MaterialGlobalCatalog;

export type IMaterialGlobalCatalogRemove = {
  id: string; // MaterialGlobalCatalog has string id
};

export type IMaterialGlobalCatalogSelect = Prisma.MaterialGlobalCatalogSelect;

export type IMaterialGlobalCatalogRelatedData = {
  // Will be added later
};
