import type { MappingConfig } from '@/lib/payload-creator';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptAddPayload
} from '../../receipt-types';

export const receiptServiceUsageMapping: MappingConfig<
  IMaterialReceiptAddForm,
  IMaterialReceiptAddPayload
> = {
  // Mapeamento direto: chave do payload -> chave do formulário
  //   title: 'title',
  receiptDate: 'receiptDate',
  notes: 'notes',

  // Mapeamento com transformação (função)
  // receiptNumber: () => `RECEIPT-${Date.now()}`, // Gerado na hora

  // Transformação de ID para objeto {id: ...}
  destinationWarehouse: (data) => ({ id: data.destinationWarehouseId }),
  //TODO: EMBAIXO!!!
  movementType: (data) =>
    data.movementTypeCode && { code: data.movementTypeCode },
  processedByUser: (data) =>
    data.processedByUserId && { id: Number(data.processedByUserId) },
  materialRequest: (data) =>
    data.materialRequestId && { id: Number(data.materialRequestId) },

  items: (data) =>
    data.items.map((item) => ({
      materialId: item.materialId,
      materialRequestItemId: item.materialRequestItemId,
      quantityExpected: item.quantityExpected,
      quantityReceived: item.quantityReceived,
      quantityRejected: item.quantityRejected,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined
    }))

  //   maintenanceRequestId: 'maintenanceRequestId',
  //   warehouseId: 'warehouseId',
  //   processedByUserId: 'processedByUserId',
  //   collectedByWorkerId: 'collectedByWorkerId',
  //   movementTypeId: 'movementTypeId',
  //   materialRequestId: 'materialRequestId',

  //     // Transformação com lógica condicional
  //   materialRequests: (data) =>
  //     data.materialRequestProtocol ? [{ protocolNumber: data.materialRequestProtocol }] : [],

  //   // Campos que não vêm do formulário, mas precisam estar no payload
  //   solutionDetails: () => "Solution provided", // Valor padrão
  //   completedAt: () => new Date("2023-11-10T14:30:00.000Z").toISOString(), // Valor fixo como exemplo
  //   currentMaintenanceInstance: () => ({ id: 1 }), // Valor fixo como exemplo
};

//
