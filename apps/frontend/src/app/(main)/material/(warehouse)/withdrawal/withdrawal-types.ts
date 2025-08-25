import {
  MaterialWithdrawal,
  MaterialWithdrawalItem,
  Prisma
} from '@sisman/prisma';
import { IUser } from '../../../user/user-types';
import { IMaterialGlobalCatalogEdit } from '../../global-catalog/material-global-catalog-types';
import { IWarehouseStockIncludedComputed } from '../warehouse-stock/warehouse-stock-types';
import { MaterialOperationOutKey } from '@/mappers/material-operations-mappers';

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
  movementType: { code: MaterialOperationOutKey };
  processedByUser: { id: number };
  collectedByUser?: { id: number };
  collectedByWorker?: { id: number };
  materialRequest?: { id: number };
  maintenanceRequest?: { id: number };
  materialPickingOrder?: { id: number };
}

export interface IMaterialWithdrawalRelatedData {
  listUsers?: IUser[];
}

export interface IMaterialWithdrawalAddForm
  extends Omit<Prisma.MaterialWithdrawalCreateManyInput, 'movementTypeId'> {
  movementTypeCode: MaterialOperationOutKey;
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
  movementTypeCode: 'Código do Movimento',
  materialRequestId: 'Requisição de Material',
  notes: 'Observações',
  collectorType: 'Coletado por',
  collectedByWorkerId: 'Coletado por funcionário',
  materialPickingOrderId: 'Requisição de Coleta',
  items: 'Itens para retirada',
  legacy_place: 'Local'
};
