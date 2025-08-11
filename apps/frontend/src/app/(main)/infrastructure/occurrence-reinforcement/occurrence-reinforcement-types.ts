import { InfrastructureOccurrenceReinforcement, Prisma } from '@sisman/prisma';

export type IOccurrenceReinforcementWithRelations = Prisma.InfrastructureOccurrenceReinforcementGetPayload<{
  include: {occurrence:true,user:true}
}>;

export interface IOccurrenceReinforcementAdd extends Omit<Prisma.InfrastructureOccurrenceReinforcementCreateInput, 
  'occurrence' | 'user'
> {}

export interface IOccurrenceReinforcementEdit extends IOccurrenceReinforcementAdd {
  id: number;
}

export type IOccurrenceReinforcement = InfrastructureOccurrenceReinforcement;

export type IOccurrenceReinforcementRemove = {
  id: number;
};

export type IOccurrenceReinforcementSelect = Prisma.InfrastructureOccurrenceReinforcementSelect;

export type IOccurrenceReinforcementRelatedData = {
  // Will be added later
};
