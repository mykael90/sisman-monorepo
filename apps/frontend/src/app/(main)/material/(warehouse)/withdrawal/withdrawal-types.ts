import {
  MaterialWithdrawal,
  MaterialWithdrawalItem,
  Prisma
} from '@sisman/prisma';
import { IUser } from '../../../user/user-types';
import {
  IMaterialGlobalCatalogAdd,
  IMaterialGlobalCatalogWithRelations
} from '../../global-catalog/material-global-catalog-types';

export type IMaterialWithdrawal = MaterialWithdrawal;

export interface IMaterialWithdrawalAdd
  extends Partial<Prisma.MaterialWithdrawalCreateManyInput> {}

export interface IMaterialWithdrawalEdit extends IMaterialWithdrawalAdd {}

export type IMaterialWithdrawalItem = MaterialWithdrawalItem;

export interface IMaterialWithdrawalItemAdd
  extends Prisma.MaterialWithdrawalItemCreateManyInput {}

// TODO:
export interface IMaterialWithdrawalAddPayload extends IMaterialWithdrawalAdd {
  items: IMaterialWithdrawalItemAddForm[];
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

export interface IMaterialWithdrawalAddForm extends IMaterialWithdrawalAdd {
  items: IMaterialWithdrawalItemAddForm[];
  collectorType: string;
}

export type IMaterialWithdrawalItemAddForm =
  Partial<IMaterialWithdrawalItemAdd> &
    Omit<IMaterialGlobalCatalogAdd, 'id' | 'materialWithdrawalId'> & {
      key: number;
      freeBalanceQuantity: number;
      physicalOnHandQuantity: number;
    };

export const fieldsLabelsWithdrawalForm: Partial<
  Record<keyof IMaterialWithdrawalAddForm, string>
> = {
  collectedByUserId: 'Coletado pelo usuário',
  withdrawalNumber: 'Número da Retirada',
  withdrawalDate: 'Data da Retirada',
  maintenanceRequestId: 'Requisição de Manutenção',
  warehouseId: 'Depósito',
  processedByUserId: 'Processado por',
  movementTypeId: 'Tipo de Movimento',
  materialRequestId: 'Requisição de Material',
  notes: 'Observações',
  collectorType: 'Coletado por'
};
