import type { MappingConfig } from '@/lib/payload-creator';
import {
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderAddPayload
} from '../material-picking-order-types';

export const pickingorderServiceUsageMapping: MappingConfig<
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderAddPayload
> = {
  // Mapeamento direto: chave do payload -> chave do formulário
  //   title: 'title',
  desiredPickupDate: 'desiredPickupDate',
  notes: 'notes',
  collectedByOther: 'collectedByOther',
  legacy_place: 'legacy_place',
  // requestedByUserId: 'requestedByUserId',
  // Mapeamento com transformação (função)
  // pickingorderNumber: () => `PICKINGORDER-${Date.now()}`, // Gerado na hora

  // Transformação de ID para objeto {id: ...}
  warehouse: (data) => ({ id: data.warehouseId }),
  //TODO: EMBAIXO!!!
  processedByUser: (data) =>
    data.proccessedByUserId && { id: Number(data.proccessedByUserId) },
  beCollectedByUser: (data) =>
    data.beCollectedByUserId && { id: Number(data.beCollectedByUserId) },
  beCollectedByWorker: (data) =>
    data.beCollectedByWorkerId && { id: Number(data.beCollectedByWorkerId) },
  materialRequest: (data) =>
    data.materialRequestId && { id: Number(data.materialRequestId) },
  maintenanceRequest: (data) =>
    data.maintenanceRequestId && { id: Number(data.maintenanceRequestId) },
  requestedByUser: (data) =>
    data.requestedByUserId && { id: Number(data.requestedByUserId) },

  items: (data) =>
    data.items.map((item) => ({
      globalMaterialId: item.globalMaterialId,
      materialInstanceId: item.materialInstanceId,
      quantityToPick: item.quantityToPick,
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
