import type { MappingConfig } from '@/lib/payload-creator';

import type { IMaterialWithdrawalAddServiceUsage } from './material-withdrawal-service-usage';
import type { IMaterialWithdrawalAddWithRelations } from '../../withdrawal-types';

export const withdrawalServiceUsageMapping: MappingConfig<
  IMaterialWithdrawalAddServiceUsage,
  IMaterialWithdrawalAddWithRelations
> = {
  // Mapeamento direto: chave do payload -> chave do formulário
  //   title: 'title',

  // Mapeamento com transformação (função)
  withdrawalNumber: () => `WITHDRAWAL-${Date.now()}`, // Gerado na hora

  // Transformação de ID para objeto {id: ...}
  warehouse: (data) => ({ id: data.warehouseId }),
  //TODO: EMBAIXO!!!
  movementType: (data) => data.movementTypeId && { code: 'OUT_SERVICE_USAGE' },
  processedByUser: (data) =>
    data.processedByUserId && { id: data.processedByUserId },
  collectedByUser: (data) =>
    data.collectedByUserId && { id: data.collectedByWorkerId },
  collectedByWorker: (data) =>
    data.collectedByWorkerId && { id: data.collectedByWorkerId },
  materialRequest: (data) =>
    data.materialRequestId && { id: data.materialRequestId },
  maintenanceRequest: (data) =>
    data.maintenanceRequestId && { id: data.maintenanceRequestId },
  materialPickingOrder: (data) =>
    data.materialPickingOrderId && { id: data.materialPickingOrderId },

  items: (data) =>
    data.items.map((item) => ({
      globalMaterialId: item.globalMaterialId,
      materialInstanceId: item.materialInstanceId,
      quantityWithdrawn: item.quantityWithdrawn,
      materialRequestItemId: item.materialRequestItemId
    })),

  withdrawalDate: 'withdrawalDate',
  //   maintenanceRequestId: 'maintenanceRequestId',
  //   warehouseId: 'warehouseId',
  //   processedByUserId: 'processedByUserId',
  //   collectedByWorkerId: 'collectedByWorkerId',
  //   movementTypeId: 'movementTypeId',
  //   materialRequestId: 'materialRequestId',
  notes: 'notes'

  //     // Transformação com lógica condicional
  //   materialRequests: (data) =>
  //     data.materialRequestProtocol ? [{ protocolNumber: data.materialRequestProtocol }] : [],

  //   // Campos que não vêm do formulário, mas precisam estar no payload
  //   solutionDetails: () => "Solution provided", // Valor padrão
  //   completedAt: () => new Date("2023-11-10T14:30:00.000Z").toISOString(), // Valor fixo como exemplo
  //   currentMaintenanceInstance: () => ({ id: 1 }), // Valor fixo como exemplo
};

//
