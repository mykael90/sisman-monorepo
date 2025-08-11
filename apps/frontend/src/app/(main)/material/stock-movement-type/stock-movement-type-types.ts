import { MaterialStockMovementType, Prisma } from '@sisman/prisma';

export type IStockMovementTypeWithRelations = Prisma.MaterialStockMovementTypeGetPayload<{
  include: {materialStockMovements:true}
}>;

export interface IStockMovementTypeAdd extends Omit<Prisma.MaterialStockMovementTypeCreateInput, 
  'materialStockMovements'
> {}

export interface IStockMovementTypeEdit extends IStockMovementTypeAdd {
  id: number;
}

export type IStockMovementType = MaterialStockMovementType;

export type IStockMovementTypeRemove = {
  id: number;
};

export type IStockMovementTypeSelect = Prisma.MaterialStockMovementTypeSelect;

export type IStockMovementTypeRelatedData = {
  // Will be added later
};
