import type { MappingConfig } from '@/lib/payload-creator';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptAddPayload
} from '../../receipt-types';
import { MaterialOperationInKey } from '@/mappers/material-operations-mappers';

export const receiptServiceUsageMapping: MappingConfig<
  IMaterialReceiptAddForm,
  IMaterialReceiptAddPayload
> = {
  receiptDate: 'receiptDate',
  notes: 'notes',
  sourceName: 'sourceName',
  externalReference: 'externalReference',

  destinationWarehouse: (data) => ({ id: data.destinationWarehouseId }),
  movementType: (data) =>
    data.movementTypeCode && {
      code: data.movementTypeCode as MaterialOperationInKey
    },
  processedByUser: (data) =>
    data.processedByUserId && { id: Number(data.processedByUserId) },

  items: (data) =>
    data.items.map((item) => ({
      materialId: item.materialId,
      quantityReceived: item.quantityReceived,
      materialRequestItemId: item.materialRequestItemId,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined
    }))
};
