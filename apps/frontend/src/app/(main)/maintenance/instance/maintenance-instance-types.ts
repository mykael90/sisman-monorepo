import { Prisma } from '@sisman/prisma';

export type MaintenanceInstanceList = Prisma.MaintenanceInstanceGetPayload<{
  select: {
    id: true;
    name: true;
    isActive: true;
    sipacId: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type MaintenanceInstanceAdd = Prisma.MaintenanceInstanceCreateInput;
export type MaintenanceInstanceEdit = Prisma.MaintenanceInstanceUpdateInput & {
  id: number;
};

export type MaintenanceInstanceWithRelations =
  Prisma.MaintenanceInstanceGetPayload<{
    include: {
      currentMaintenanceRequests: true;
      warehouses: true;
    };
  }>;
