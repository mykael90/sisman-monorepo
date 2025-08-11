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
