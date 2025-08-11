import { InfrastructureFacilityComplex, Prisma } from '@sisman/prisma';

export type IFacilityComplexWithRelations =
  Prisma.InfrastructureFacilityComplexGetPayload<{
    include: {
      maintenanceInstance: true;
      buildings: true;
    };
  }>;

export interface IFacilityComplexAdd
  extends Omit<
    Prisma.InfrastructureFacilityComplexCreateInput,
    'buildings' | 'maintenanceInstance'
  > {
  maintenanceInstanceId?: number | null;
}

export interface IFacilityComplexEdit extends IFacilityComplexAdd {
  id: string;
}

export type IFacilityComplex = InfrastructureFacilityComplex;

export type IFacilityComplexRemove = {
  id: string;
};

export type IFacilityComplexSelect = Prisma.InfrastructureFacilityComplexSelect;

export type IFacilityComplexRelatedData = {
  // Will be added later
};
