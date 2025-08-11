import { InfrastructureSpace, Prisma } from '@sisman/prisma';

export type ISpaceWithRelations = Prisma.InfrastructureSpaceGetPayload<{
  include: {spaceType:true,building:true,parent:true,children:true,InfrastructureSpaceUser:true}
}>;

export interface ISpaceAdd extends Omit<Prisma.InfrastructureSpaceCreateInput, 
  'spaceType' | 'building' | 'parent' | 'children' | 'InfrastructureSpaceUser'
> {}

export interface ISpaceEdit extends ISpaceAdd {
  id: number;
}

export type ISpace = InfrastructureSpace;

export type ISpaceRemove = {
  id: number;
};

export type ISpaceSelect = Prisma.InfrastructureSpaceSelect;

export type ISpaceRelatedData = {
  // Will be added later
};
