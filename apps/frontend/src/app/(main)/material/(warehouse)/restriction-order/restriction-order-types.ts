import { MaterialRestrictionOrder, Prisma } from '@sisman/prisma';

export type IRestrictionOrderWithRelations = Prisma.MaterialRestrictionOrderGetPayload<{
  include: {}
}>;

export interface IRestrictionOrderAdd extends Omit<Prisma.MaterialRestrictionOrderCreateInput, 
  
> {}

export interface IRestrictionOrderEdit extends IRestrictionOrderAdd {
  id: number;
}

export type IRestrictionOrder = MaterialRestrictionOrder;

export type IRestrictionOrderRemove = {
  id: number;
};

export type IRestrictionOrderSelect = Prisma.MaterialRestrictionOrderSelect;

export type IRestrictionOrderRelatedData = {
  // Will be added later
};
