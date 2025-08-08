// --- 1. Operação: IN (ENTRADA) ---
export const materialOperationInDisplayMap = {
  IN_CENTRAL: 'IN_CENTRAL', // Entrada por Transferência da Central
  IN_PURCHASE: 'IN_PURCHASE', // Entrada por Compra
  IN_DONATION: 'IN_DONATION', // Entrada por Doação (Recebida)
  IN_TRANSFER: 'IN_TRANSFER', // Entrada por Transferência (Recebida)
  IN_SERVICE_SURPLUS: 'IN_SERVICE_SURPLUS', // Entrada por Sobra de Serviço
  IN_RETURN_FROM_ISSUE: 'IN_RETURN_FROM_ISSUE', // Entrada por Devolução (Saída Revertida)
  INITIAL_STOCK_LOAD: 'INITIAL_STOCK_LOAD', // Carga Inicial de Estoque
  IN_LOAN_RETURN: 'IN_LOAN_RETURN' // Entrada por Devolução de Empréstimo
} as const;

export type MaterialOperationInKey = keyof typeof materialOperationInDisplayMap;
export type MaterialOperationInDisplay =
  (typeof materialOperationInDisplayMap)[MaterialOperationInKey];

// --- 2. Operação: OUT (SAIDA) ---
export const materialOperationOutDisplayMap = {
  OUT_SERVICE_USAGE: 'OUT_SERVICE_USAGE', // Saída para Uso em Serviço
  OUT_EMERGENCY_USAGE: 'OUT_EMERGENCY_USAGE', // Saída de Emergência para Serviço
  OUT_CENTRAL: 'OUT_CENTRAL', // Saída por Transferência para Central
  OUT_TRANSFER: 'OUT_TRANSFER', // Saída por Transferência (Despachada)
  OUT_DISPOSAL_DAMAGE: 'OUT_DISPOSAL_DAMAGE', // Saída por Descarte (Danificado)
  OUT_DISPOSAL_OBSOLETE: 'OUT_DISPOSAL_OBSOLETE', // Saída por Descarte (Obsoleto)
  OUT_EXPIRATION: 'OUT_EXPIRATION', // Saída por Vencimento
  OUT_DONATION: 'OUT_DONATION', // Saída por Doação (Realizada)
  OUT_LOSS: 'OUT_LOSS', // Saída por Perda/Roubo
  OUT_PROCESSING: 'OUT_PROCESSING', // Saída para beneficiamento
  OUT_LOAN: 'OUT_LOAN' // Saída por Empréstimo
} as const;

export type MaterialOperationOutKey =
  keyof typeof materialOperationOutDisplayMap;
export type MaterialOperationOutDisplay =
  (typeof materialOperationOutDisplayMap)[MaterialOperationOutKey];

// --- 3. Operação: ADJUSTMENT (AJUSTE) ---
export const materialOperationAdjustmentDisplayMap = {
  ADJUSTMENT_INV_IN: 'ADJUSTMENT_INV_IN', // Ajuste de Inventário (Positivo)
  ADJUSTMENT_INV_OUT: 'ADJUSTMENT_INV_OUT', // Ajuste de Inventário (Negativo)
  ADJUSTMENT_RECLASSIFY_IN: 'ADJUSTMENT_RECLASSIFY_IN', // Ajuste por Reclassificação (Entrada)
  ADJUSTMENT_RECLASSIFY_OUT: 'ADJUSTMENT_RECLASSIFY_OUT' // Ajuste por Reclassificação (Saída)
} as const;

export type MaterialOperationAdjustmentKey =
  keyof typeof materialOperationAdjustmentDisplayMap;
export type MaterialOperationAdjustmentDisplay =
  (typeof materialOperationAdjustmentDisplayMap)[MaterialOperationAdjustmentKey];

// --- 4. Operação: RESERVATION (RESERVA) ---
export const materialOperationReservationDisplayMap = {
  RESERVE_FOR_PICKING_ORDER: 'RESERVE_FOR_PICKING_ORDER', // Reserva para Ordem de Separação
  RELEASE_PICKING_RESERVATION: 'RELEASE_PICKING_RESERVATION', // Liberação de Reserva (Ordem de Separação)
  RESERVE_FOR_SPECIFIC_DEMAND: 'RESERVE_FOR_SPECIFIC_DEMAND', // Reserva para Demanda Específica
  RELEASE_SPECIFIC_RESERVATION: 'RELEASE_SPECIFIC_RESERVATION' // Liberação de Reserva (Demanda Específica)
} as const;

export type MaterialOperationReservationKey =
  keyof typeof materialOperationReservationDisplayMap;
export type MaterialOperationReservationDisplay =
  (typeof materialOperationReservationDisplayMap)[MaterialOperationReservationKey];

// --- 5. Operação: RESTRICTION (RESTRICAO) ---
export const materialOperationRestrictionDisplayMap = {
  RESTRICT_FOR_PAID_ITEM: 'RESTRICT_FOR_PAID_ITEM', // Restrição para Item Pago
  RELEASE_PAID_RESTRICTION: 'RELEASE_PAID_RESTRICTION' // Liberação de Restrição (Item Pago)
} as const;

export type MaterialOperationRestrictionKey =
  keyof typeof materialOperationRestrictionDisplayMap;
export type MaterialOperationRestrictionDisplay =
  (typeof materialOperationRestrictionDisplayMap)[MaterialOperationRestrictionKey];
