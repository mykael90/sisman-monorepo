import {
  MaterialGlobalCatalog,
  MaterialWithdrawal,
  MaterialWithdrawalItem,
  Prisma
} from '@sisman/prisma';

export type IMaterialGlobalCatalog = MaterialGlobalCatalog;

export interface IMaterialGlobalCatalogAdd
  extends Prisma.MaterialGlobalCatalogCreateManyInput {}

export interface IMaterialGlobalCatalogEdit extends IMaterialGlobalCatalogAdd {}

export type IMaterialWithdrawal = MaterialWithdrawal;

export interface IMaterialWithdrawalAdd
  extends Prisma.MaterialWithdrawalCreateManyInput {}

export interface IMaterialWithdrawalEdit extends IMaterialWithdrawalAdd {}

export type IMaterialWithdrawalItem = MaterialWithdrawalItem;

export interface IMaterialWithdrawalItemAdd
  extends Prisma.MaterialWithdrawalItemCreateManyInput {}

export interface IMaterialWithdrawalItemEdit
  extends IMaterialWithdrawalItemAdd {}

export type IMaterialWithdrawalWithRelations =
  Prisma.MaterialWithdrawalGetPayload<{
    include: {
      items: true;
      maintenanceRequest: true;
      collectedByUser: true;
      collectedByWorker: true;
      materialPickingOrder: true;
      materialRequest: true;
      movementType: true;
      processedByUser: true;
      warehouse: true;
    };
  }>;
