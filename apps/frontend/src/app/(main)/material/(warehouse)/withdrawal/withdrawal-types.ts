import {
  MaterialWithdrawal,
  MaterialWithdrawalItem,
  Prisma
} from '@sisman/prisma';
import { IUser } from '../../../user/user-types';
import { IMaterialGlobalCatalogEdit } from '../../global-catalog/material-global-catalog-types';
import { IWarehouseStockIncludedComputed } from '../warehouse-stock/warehouse-stock-types';
import { MaterialOperationOutKey } from '@/mappers/material-operations-mappers';
import { IWorker } from '../../../worker/worker-types';
import { Session } from 'next-auth';

export type IMaterialWithdrawal = MaterialWithdrawal;

export type IMaterialWithdrawalWithRelations =
  Prisma.MaterialWithdrawalGetPayload<{
    include: {
      items: {
        include: {
          globalMaterial: true;
        };
      };
      maintenanceRequest: {
        include: { building: true; facilityComplex: true };
      };
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

export type IMaterialWithdrawalItemWithRelations =
  Prisma.MaterialWithdrawalItemGetPayload<{
    include: {
      globalMaterial: true;
    };
  }>;

export interface IMaterialWithdrawalAddPayload
  extends Omit<
    Prisma.MaterialWithdrawalCreateManyInput,
    'warehouseId' | 'movementTypeId' | 'processedByUserId'
  > {
  items: Prisma.MaterialWithdrawalItemCreateManyMaterialWithdrawalInput[];
  warehouse: { id: number };
  movementType: { code: MaterialOperationOutKey };
  processedByUser: { id: number };
  authorizedByUser: { id: number };
  collectedByUser?: { id: number };
  collectedByWorker?: { id: number };
  materialRequest?: { id: number };
  maintenanceRequest?: { id: number };
  materialPickingOrder?: { id: number };
}

export interface IMaterialWithdrawalRelatedData {
  session?: Session;
  listUsers?: IUser[];
  listWorkers?: IWorker[];
}

export interface IMaterialWithdrawalAddForm
  extends Omit<Prisma.MaterialWithdrawalCreateManyInput, 'movementTypeId'> {
  movementTypeCode: MaterialOperationOutKey;
  items: IMaterialWithdrawalItemAddForm[];
  collectorType: string;
  collectedByOther?: string;
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
  collectedByOther: 'Nome da entidade (pessoa física ou jurídica)',
  withdrawalNumber: 'Número da Retirada',
  withdrawalDate: 'Data da Retirada',
  maintenanceRequestId: 'Requisição de Manutenção',
  warehouseId: 'Depósito',
  processedByUserId: 'Processado por',
  authorizedByUserId: 'Autorizado por',
  movementTypeCode: 'Código do Movimento',
  materialRequestId: 'Requisição de Material',
  notes: 'Observações',
  collectorType: 'Coletado por',
  collectedByWorkerId: 'Coletado por funcionário',
  materialPickingOrderId: 'Requisição de Coleta',
  items: 'Itens para retirada',
  legacy_place: 'Local'
};
