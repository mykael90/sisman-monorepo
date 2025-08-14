import {
  MaterialWithdrawal,
  MaterialWithdrawalItem,
  Prisma
} from '@sisman/prisma';
import { IUser } from '../../user/user-types';
import { IMaterialGlobalCatalogWithRelations } from '../global-catalog/material-global-catalog-types';

export type IMaterialWithdrawal = MaterialWithdrawal;

export interface IMaterialWithdrawalAdd
  extends Prisma.MaterialWithdrawalCreateManyInput {}

export interface IMaterialWithdrawalEdit extends IMaterialWithdrawalAdd {}

export type IMaterialWithdrawalItem = MaterialWithdrawalItem;

export interface IMaterialWithdrawalItemAdd
  extends Prisma.MaterialWithdrawalItemCreateManyInput {}

export interface IMaterialWithdrawalAddWithRelations
  extends IMaterialWithdrawalAdd {
  items: IMaterialWithdrawalItemAdd[];
  warehouse: { id: number };
  movementType: { code: string };
  processedByUser: { id: number };
  collectedByUser: { id: number };
  collectedByWorker: { id: number };
  materialRequest: { id: number };
  maintenanceRequest: { id: number };
  materialPickingOrder: { id: number };
}

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

export interface IMaterialWithdrawalRelatedData {
  listGlobalMaterials?: IMaterialGlobalCatalogWithRelations[];
  listUsers?: IUser[];
}
