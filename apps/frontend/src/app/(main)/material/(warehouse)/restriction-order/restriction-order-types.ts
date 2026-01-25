import { MaterialRestrictionOrder, Prisma } from '@sisman/prisma';

export type IRestrictionOrderWithRelations =
  Prisma.MaterialRestrictionOrderGetPayload<{
    include: {};
  }>;

export interface IRestrictionOrderAdd extends Omit<
  Prisma.MaterialRestrictionOrderCreateInput,
  'createdAt' | 'updatedAt'
> {}

export interface IRestrictionOrderEdit extends IRestrictionOrderAdd {
  id: number;
}

export type IRestrictionOrder = MaterialRestrictionOrder;

export type IRestrictionOrderRemove = {
  id: number;
};

export type IRestrictionOrderSelect = Prisma.MaterialRestrictionOrderSelect;

export type IRestrictionOrderRelatedData = {
  // Will be added later
};

export type IRestrictionsItemsByWarehouseAndByMaterialId =
  Prisma.MaterialRestrictionOrderItemGetPayload<{
    include: {
      materialRestrictionOrder: {
        select: {
          targetMaterialRequest: {
            select: {
              id: true;
              protocolNumber: true;
              requestDate: true;
              currentStatus: true;
              origin: true;
              updatedAt: true;
              sipacUserLoginRequest: true;
              sipacUnitCost: {
                select: {
                  id: true;
                  codigoUnidade: true;
                  nomeUnidade: true;
                  sigla: true;
                };
              };
              maintenanceRequest: {
                select: {
                  id: true;
                  protocolNumber: true;
                  requestedAt: true;
                  origin: true;
                  updatedAt: true;
                };
              };
            };
          };
        };
      };
    };
  }>;
