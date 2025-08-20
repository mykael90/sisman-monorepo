import {
  MaterialGlobalCatalog,
  MaterialWarehouseStock,
  Prisma
} from '@sisman/prisma';
import { IWarehouseStockIncludedComputed } from '../(warehouse)/warehouse-stock/warehouse-stock-types';

export interface IMaterialGlobalCatalog extends MaterialGlobalCatalog {}

export interface IMaterialGlobalCatalogWithRelations
  extends IMaterialGlobalCatalog {
  warehouseStandardStocks?: IWarehouseStockIncludedComputed[];
}

type IMaterialWareHouseStock = MaterialWarehouseStock;

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

export type IMaterialGlobalCatalogRemove = {
  id: string; // MaterialGlobalCatalog has string id
};

export type IMaterialGlobalCatalogSelect = Prisma.MaterialGlobalCatalogSelect;

export type IMaterialGlobalCatalogRelatedData = {
  // Will be added later
};
