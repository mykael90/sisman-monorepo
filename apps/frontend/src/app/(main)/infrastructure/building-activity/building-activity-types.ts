import { InfrastructureBuildingActivity, Prisma } from '@sisman/prisma';

export type IBuildingActivityWithRelations =
  Prisma.InfrastructureBuildingActivityGetPayload<{
    include: {
      buldingsSecondary: true;
      buldingsPrimary: true;
      infrastructureBuildingType: true;
    };
  }>;

export interface IBuildingActivityAdd
  extends Omit<
    Prisma.InfrastructureBuildingActivityCreateInput,
    'buldingsSecondary' | 'buldingsPrimary' | 'infrastructureBuildingType'
  > {}

export interface IBuildingActivityEdit extends IBuildingActivityAdd {
  id: number;
}

export type IBuildingActivity = InfrastructureBuildingActivity;

export type { InfrastructureBuildingActivity };

export type IBuildingActivityRemove = {
  id: number;
};

export type IBuildingActivitySelect =
  Prisma.InfrastructureBuildingActivitySelect;

export type IBuildingActivityRelatedData = {
  // Will be added later
};
