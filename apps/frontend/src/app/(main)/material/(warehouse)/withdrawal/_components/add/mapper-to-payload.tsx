import type { MappingConfig } from '@/lib/payload-creator';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalAddPayload
} from '../../withdrawal-types';

export const withdrawalServiceUsageMapping: MappingConfig<
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalAddPayload
> = {
  // Mapeamento direto: chave do payload -> chave do formulário
  //   title: 'title',
  withdrawalDate: 'withdrawalDate',
  notes: 'notes',
  collectedByOther: 'collectedByOther',
  legacy_place: 'legacy_place',

  // Mapeamento com transformação (função)
  // withdrawalNumber: () => `WITHDRAWAL-${Date.now()}`, // Gerado na hora

  // Transformação de ID para objeto {id: ...}
  warehouse: (data) => ({ id: data.warehouseId }),
  //TODO: EMBAIXO!!!
  movementType: (data) =>
    data.movementTypeCode && { code: data.movementTypeCode },
  processedByUser: (data) =>
    data.processedByUserId && { id: Number(data.processedByUserId) },
  collectedByUser: (data) =>
    data.collectedByUserId && { id: Number(data.collectedByUserId) },
  collectedByWorker: (data) =>
    data.collectedByWorkerId && { id: Number(data.collectedByWorkerId) },
  materialRequest: (data) =>
    data.materialRequestId && { id: Number(data.materialRequestId) },
  maintenanceRequest: (data) =>
    data.maintenanceRequestId && { id: Number(data.maintenanceRequestId) },
  materialPickingOrder: (data) =>
    data.materialPickingOrderId && { id: Number(data.materialPickingOrderId) },

  items: (data) =>
    data.items.map((item) => ({
      globalMaterialId: item.globalMaterialId,
      materialInstanceId: item.materialInstanceId,
      quantityWithdrawn: item.quantityWithdrawn,
      materialRequestItemId: item.materialRequestItemId,
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
