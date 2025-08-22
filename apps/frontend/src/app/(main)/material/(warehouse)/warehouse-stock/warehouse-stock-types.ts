import { MaterialWarehouseStock, Prisma } from '@sisman/prisma';

export type IWarehouseStockWithRelations =
  Prisma.MaterialWarehouseStockGetPayload<{
    include: {};
  }>;

export interface IWarehouseStockAdd
  extends Prisma.MaterialWarehouseStockCreateInput {}

export interface IWarehouseStockEdit extends IWarehouseStockAdd {
  id: number;
}

export type IWarehouseStock = MaterialWarehouseStock;

export type IWarehouseStockIncludedComputed = IWarehouseStock & {
  physicalOnHandQuantity: null | number | string | Prisma.Decimal;
  freeBalanceQuantity: null | number | string | Prisma.Decimal;
};

export type IWarehouseStockRemove = {
  id: number;
};

export type IWarehouseStockSelect = Prisma.MaterialWarehouseStockSelect;

export type IWarehouseStockRelatedData = {
  // Will be added later
};
