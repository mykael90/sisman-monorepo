import { MaterialPickingOrder, Prisma } from '@sisman/prisma';

export type IPickingOrderWithRelations = Prisma.MaterialPickingOrderGetPayload<{
  include: {
    maintenanceRequest: {
      include: {
        facilityComplex: true;
        building: true;
      };
    };
    warehouse: true;
    materialRequest: true;
    items: true;
    beCollectedByUser: true;
    beCollectedByWorker: true;
  };
}>;

export interface IPickingOrderAdd
  extends Omit<Prisma.MaterialPickingOrderCreateInput, 'maintenanceRequest'> {}

export interface IPickingOrderEdit extends IPickingOrderAdd {
  id: number;
}

export type IPickingOrder = MaterialPickingOrder;

export type IPickingOrderRemove = {
  id: number;
};

export type IPickingOrderSelect = Prisma.MaterialPickingOrderSelect;

export type IPickingOrderRelatedData = {
  // Will be added later
};
