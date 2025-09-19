// --- 1. Status da Ordem de Separação ---
export const materialPickingOrderStatusDisplayMap = {
  PENDING_PREPARATION: 'PENDING_PREPARATION', // Aguardando almoxarifado iniciar a separação/reserva
  IN_PREPARATION: 'IN_PREPARATION', // Almoxarifado está separando/reservando os itens
  READY_FOR_PICKUP: 'READY_FOR_PICKUP', // Pronto para retirada
  PARTIALLY_WITHDRAWN: 'PARTIALLY_WITHDRAWN', // Parte dos itens desta ordem já foi retirada
  FULLY_WITHDRAWN: 'FULLY_WITHDRAWN', // Todos os itens desta ordem foram retirados
  CANCELLED: 'CANCELLED', // Ordem de separação cancelada
  EXPIRED: 'EXPIRED' // Ordem de separação vencida
} as const;

export type TMaterialPickingOrderStatusKey =
  keyof typeof materialPickingOrderStatusDisplayMap;
export type TMaterialPickingOrderStatusDisplay =
  (typeof materialPickingOrderStatusDisplayMap)[TMaterialPickingOrderStatusKey];
