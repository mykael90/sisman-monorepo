import {
  MaterialWithdrawal,
  MaterialWithdrawalItem,
  Prisma
} from '@sisman/prisma';
import { IUser } from '../../../user/user-types';
import {
  IMaterialGlobalCatalogEdit,
  IMaterialGlobalCatalogWithRelations
} from '../../global-catalog/material-global-catalog-types';
import {
  IWarehouseStock,
  IWarehouseStockIncludedComputed
} from '../warehouse-stock/warehouse-stock-types';

export type IMaterialWithdrawal = MaterialWithdrawal;

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

export type IMaterialWithdrawalItem = MaterialWithdrawalItem;

// TODO:
export interface IMaterialWithdrawalAddPayload
  extends Omit<
    Prisma.MaterialWithdrawalCreateManyInput,
    'warehouseId' | 'movementTypeId' | 'processedByUserId'
  > {
  items: Prisma.MaterialWithdrawalItemCreateManyMaterialWithdrawalInput[];
  warehouse: { id: number };
  movementType: { code: string };
  processedByUser: { id: number };
  collectedByUser?: { id: number };
  collectedByWorker?: { id: number };
  materialRequest?: { id: number };
  maintenanceRequest?: { id: number };
  materialPickingOrder?: { id: number };
}

export interface IMaterialWithdrawalRelatedData {
  listGlobalMaterials?: IMaterialGlobalCatalogWithRelations[];
  listUsers?: IUser[];
}

export interface IMaterialWithdrawalAddForm
  extends Prisma.MaterialWithdrawalCreateManyInput {
  items: IMaterialWithdrawalItemAddForm[];
  collectorType: string;
}

export interface IMaterialWithdrawalEditForm
  extends Partial<IMaterialWithdrawalAddForm> {}

export type IMaterialWithdrawalItemAddForm =
  Prisma.MaterialWithdrawalItemCreateManyMaterialWithdrawalInput &
    Partial<
      Pick<IMaterialGlobalCatalogEdit, 'name' | 'description' | 'unitOfMeasure'>
    > &
    Partial<
      Pick<
        IWarehouseStockIncludedComputed,
        'freeBalanceQuantity' | 'physicalOnHandQuantity'
      >
    > & {
      key: number;
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
  collectorType: 'Coletado por',
  collectedByWorkerId: 'Coletado por funcionário',
  materialPickingOrderId: 'Requisição de Coleta',
  items: 'Itens para retirada',
  legacy_place: 'Local'
};
