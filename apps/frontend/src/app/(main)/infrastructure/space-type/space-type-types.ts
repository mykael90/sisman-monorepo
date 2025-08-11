import { InfrastructureSpaceType, Prisma } from '@sisman/prisma';

export type ISpaceTypeWithRelations = Prisma.InfrastructureSpaceTypeGetPayload<{
  include: {spaces:true}
}>;

export interface ISpaceTypeAdd extends Omit<Prisma.InfrastructureSpaceTypeCreateInput, 
  'spaces'
> {}

export interface ISpaceTypeEdit extends ISpaceTypeAdd {
  id: number;
}

export type ISpaceType = InfrastructureSpaceType;

export type ISpaceTypeRemove = {
  id: number;
};

export type ISpaceTypeSelect = Prisma.InfrastructureSpaceTypeSelect;

export type ISpaceTypeRelatedData = {
  // Will be added later
};
