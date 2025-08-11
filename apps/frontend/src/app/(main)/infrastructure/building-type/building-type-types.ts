import { InfrastructureBuildingType, Prisma } from '@sisman/prisma';
import { InfrastructureBuildingActivity } from '../building-activity/building-activity-types';

export type IBuildingTypeWithRelations =
  Prisma.InfrastructureBuildingTypeGetPayload<{
    include: {
      infrastructureBuildingActivity: true;
    };
  }>;

export interface IBuildingTypeAdd
  extends Omit<
    Prisma.InfrastructureBuildingTypeCreateInput,
    'infrastructureBuildingActivity'
  > {}

export interface IBuildingTypeEdit extends IBuildingTypeAdd {
  id: number;
}

export type IBuildingType = InfrastructureBuildingType;

export type IBuildingTypeRemove = {
  id: number;
};

export type IBuildingTypeSelect = Prisma.InfrastructureBuildingTypeSelect;

export type IBuildingTypeRelatedData = {
  listBuildingActivities: InfrastructureBuildingActivity[];
};
