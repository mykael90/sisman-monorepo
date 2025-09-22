import { MaterialPickingOrder, Prisma } from '@sisman/prisma';
import { Session } from 'next-auth';
import { IUser } from '../../../user/user-types';
import { IWorker } from '../../../worker/worker-types';
import { MaterialOperationOutKey } from '../../../../../mappers/material-operations-mappers';
import { IMaterialGlobalCatalogEdit } from '../../global-catalog/material-global-catalog-types';
import { IWarehouseStockIncludedComputed } from '../warehouse-stock/warehouse-stock-types';

export type IMaterialPickingOrderWithRelations =
  Prisma.MaterialPickingOrderGetPayload<{
    include: {
      warehouse: true;
      materialRequest: true;
      maintenanceRequest: {
        include: {
          facilityComplex: {
            select: {
              name: true;
            };
          };
          building: {
            select: {
              name: true;
            };
          };
        };
      };
      requestedByUser: true;
      beCollectedByUser: true;
      beCollectedByWorker: true;
      items: true;
    };
  }>;

export interface IMaterialPickingOrderAdd
  extends Omit<Prisma.MaterialPickingOrderCreateInput, 'maintenanceRequest'> {}

export interface IMaterialPickingOrderAddForm
  extends Prisma.MaterialPickingOrderCreateManyInput {
  items: IMaterialPickingOrderItemAddForm[];
  collectorType: string;
  collectedByOther?: string;
}

export type IMaterialPickingOrderItemAddForm =
  Prisma.MaterialPickingOrderItemCreateManyMaterialPickingOrderInput &
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

export interface IMaterialPickingOrderEditForm
  extends Partial<IMaterialPickingOrderAddForm> {}

export interface IMaterialPickingOrderEdit extends IMaterialPickingOrderAdd {
  id: number;
}

export type IMaterialPickingOrder = MaterialPickingOrder;

export type IMaterialPickingOrderRemove = {
  id: number;
};

export type IMaterialPickingOrderSelect = Prisma.MaterialPickingOrderSelect;

export type IMaterialPickingOrderRelatedData = {
  session?: Session;
  listUsers?: IUser[];
  listWorkers?: IWorker[];
  // Will be added later
};

export const fieldsLabelsPickingOrderForm: Partial<
  Record<keyof IMaterialPickingOrderAddForm, string>
> = {
  beCollectedByUserId: 'Coletado pelo usuário',
  collectedByOther: 'Nome da entidade (pessoa física ou jurídica)',
  pickingOrderNumber: 'Número da Reserva',
  desiredPickupDate: 'Previsão de Retirada',
  maintenanceRequestId: 'Requisição de Manutenção',
  warehouseId: 'Depósito',
  proccessedByUserId: 'Processado por',
  materialRequestId: 'Requisição de Material',
  notes: 'Observações',
  collectorType: 'A ser coletado por',
  beCollectedByWorkerId: 'Coletado por funcionário',
  items: 'Itens para reserva',
  legacy_place: 'Local',
  requestedByUserId: 'Solicitado por'
};

export interface IMaterialPickingOrderAddPayload
  extends Omit<
    Prisma.MaterialPickingOrderCreateManyInput,
    'warehouseId' | 'processedByUserId' | 'requestedByUserId'
  > {
  items: Prisma.MaterialPickingOrderItemCreateManyMaterialPickingOrderInput[];
  warehouse: { id: number };
  processedByUser: { id: number };
  requestedByUser: { id: number };
  beCollectedByUser?: { id: number };
  beCollectedByWorker?: { id: number };
  materialRequest?: { id: number };
  maintenanceRequest?: { id: number };
  materialPickingOrder?: { id: number };
}
