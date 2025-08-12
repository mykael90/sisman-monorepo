import { InfrastructureBuilding, Prisma } from '@sisman/prisma';
import { IFacilityComplex } from '../facility-complex/facility-complex-types';
import { InfrastructureBuildingActivity } from '../building-activity/building-activity-types';

export type IBuildingWithRelations = Prisma.InfrastructureBuildingGetPayload<{
  include: {
    facilityComplex: true;
    primaryActivity: true;
    secondariesActivities: true;
  };
}>;

export interface IBuildingAdd
  extends Omit<
    Prisma.InfrastructureBuildingCreateInput,
    'facilityComplex' | 'primaryActivity' | 'secondariesActivities'
  > {
  facilityComplexId?: string | null;
  infrastructureBuildingTypeId?: number | null;
  secondariesActivities: { id: number }[];
}

export interface IBuildingEdit extends IBuildingAdd {
  id: string;
}

export type IBuilding = InfrastructureBuilding;

export type IBuildingRemove = {
  id: string;
};

export type IBuildingSelect = Prisma.InfrastructureBuildingSelect;

export type IBuildingRelatedData = {
  listFacilityComplexes: IFacilityComplex[];
  listBuildingActivities: InfrastructureBuildingActivity[];
};
