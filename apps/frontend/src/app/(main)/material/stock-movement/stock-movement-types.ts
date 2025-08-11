import { MaterialStockMovement, Prisma } from '@sisman/prisma';

export type IStockMovementWithRelations = Prisma.MaterialStockMovementGetPayload<{
  include: {maintenanceRequest:true,stockMovementType:true}
}>;

export interface IStockMovementAdd extends Omit<Prisma.MaterialStockMovementCreateInput, 
  'maintenanceRequest' | 'stockMovementType'
> {}

export interface IStockMovementEdit extends IStockMovementAdd {
  id: number;
}

export type IStockMovement = MaterialStockMovement;

export type IStockMovementRemove = {
  id: number;
};

export type IStockMovementSelect = Prisma.MaterialStockMovementSelect;

export type IStockMovementRelatedData = {
  // Will be added later
};
