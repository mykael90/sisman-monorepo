import { InfrastructureSystem, Prisma } from '@sisman/prisma';

export type ISystemWithRelations = Prisma.InfrastructureSystemGetPayload<{
  include: {buildings:true}
}>;

export interface ISystemAdd extends Omit<Prisma.InfrastructureSystemCreateInput, 
  'buildings'
> {}

export interface ISystemEdit extends ISystemAdd {
  id: number;
}

export type ISystem = InfrastructureSystem;

export type ISystemRemove = {
  id: number;
};

export type ISystemSelect = Prisma.InfrastructureSystemSelect;

export type ISystemRelatedData = {
  // Will be added later
};
