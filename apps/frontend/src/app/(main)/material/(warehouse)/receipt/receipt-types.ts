import { MaterialReceipt, MaterialReceiptItem, Prisma } from '@sisman/prisma';
import { IMaterialGlobalCatalogEdit } from '../../global-catalog/material-global-catalog-types';
import { Session } from 'next-auth';
import { MaterialOperationOutKey } from '../../../../../mappers/material-operations-mappers';

export type IMaterialReceipt = MaterialReceipt;

export type IMaterialReceiptWithRelations = Prisma.MaterialReceiptGetPayload<{
  include: {
    movementType: { select: { code: true; id: true; name: true } };
    destinationWarehouse: true;
    processedByUser: true;
    items: {
      include: {
        material: true;
      };
    };
    materialRequest: {
      include: {
        items: true;
        maintenanceRequest: {
          select: { id: true; protocolNumber: true };
        };
        sipacUnitCost: {
          select: { codigoUnidade: true; sigla: true; nomeUnidade: true };
        };
      };
    };
  };
}>;

export type IMaterialReceiptItem = Prisma.MaterialReceiptItemGetPayload<{
  include: {
    material: true;
  };
}>;

export interface IMaterialReceiptAddPayload
  extends Omit<
    Prisma.MaterialReceiptCreateManyInput,
    | 'destinationWarehouseId'
    | 'movementTypeId'
    | 'processedByUserId'
    | 'materialRequestId'
  > {
  items: Prisma.MaterialReceiptItemCreateManyMaterialReceiptInput[];
  destinationWarehouse: { id: number };
  movementType: { code: MaterialOperationOutKey };
  processedByUser: { id: number };
  materialRequest?: { id: number };
}

import { IMaterialRequestWithRelations } from '../../request/material-request-types';

export type IMaterialReceiptRelatedData = {
  session?: Session;
  materialRequest?: IMaterialRequestWithRelations;
};
export interface IMaterialReceiptAddForm
  extends Omit<Prisma.MaterialReceiptCreateManyInput, 'movementTypeId'> {
  movementTypeCode: string;
  items: IMaterialReceiptItemAddForm[];
}

export interface IMaterialReceiptEdit
  extends Partial<IMaterialReceiptAddForm> {}

export type IMaterialReceiptItemAddForm =
  Prisma.MaterialReceiptItemCreateManyMaterialReceiptInput &
    Partial<
      Pick<IMaterialGlobalCatalogEdit, 'name' | 'description' | 'unitOfMeasure'>
    > & { key: number | string };

export const fieldsLabelReceiptForm: Partial<
  Record<keyof IMaterialReceiptAddForm, string>
> = {
  receiptNumber: 'Número da entrada',
  receiptDate: 'Data da entrada',
  destinationWarehouseId: 'Depósito de destino',
  processedByUserId: 'Processado por',
  movementTypeCode: 'Código do Movimento',
  materialRequestId: 'Requisição de Material',
  notes: 'Observações',
  items: 'Itens para entrada',
  externalReference: 'Documento de entrada (ex: NF-e)',
  sourceName: 'Fornecedor (ou doador)'
};
