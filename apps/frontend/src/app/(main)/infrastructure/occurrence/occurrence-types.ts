import { InfrastructureOccurrence, Prisma } from '@sisman/prisma';

export type IOccurrenceWithRelations = Prisma.InfrastructureOccurrenceGetPayload<{
  include: {facilityComplex:true,building:true,space:true,reportedBy:true,reinforcements:true,diagnosis:true}
}>;

export interface IOccurrenceAdd extends Omit<Prisma.InfrastructureOccurrenceCreateInput, 
  'facilityComplex' | 'building' | 'space' | 'reportedBy' | 'reinforcements' | 'diagnosis'
> {}

export interface IOccurrenceEdit extends IOccurrenceAdd {
  id: number;
}

export type IOccurrence = InfrastructureOccurrence;

export type IOccurrenceRemove = {
  id: number;
};

export type IOccurrenceSelect = Prisma.InfrastructureOccurrenceSelect;

export type IOccurrenceRelatedData = {
  // Will be added later
};
