// --- 1. Status da Ordem de Separação (Português) ---
export const materialPickingOrderStatusDisplayMapPortuguese = {
  PENDING_PREPARATION: 'Pendente Preparação', // Aguardando almoxarifado iniciar a separação/reserva
  IN_PREPARATION: 'Em Preparação', // Almoxarifado está separando/reservando os itens
  READY_FOR_PICKUP: 'Pronto para Retirada', // Pronto para retirada
  PARTIALLY_WITHDRAWN: 'Parcialmente Retirado', // Parte dos itens desta ordem já foi retirada
  FULLY_WITHDRAWN: 'Totalmente Retirado', // Todos os itens desta ordem foram retirados
  CANCELLED: 'Cancelado', // Ordem de separação cancelada
  EXPIRED: 'Vencida' // Ordem de separação vencida
} as const;

export type TMaterialPickingOrderStatusKey =
  keyof typeof materialPickingOrderStatusDisplayMapPortuguese;
export type TMaterialPickingOrderStatusDisplay =
  (typeof materialPickingOrderStatusDisplayMapPortuguese)[TMaterialPickingOrderStatusKey];
