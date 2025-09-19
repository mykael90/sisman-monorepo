// --- 1. Operação: IN (ENTRADA) ---
export const materialOperationInDisplayMapPorguguese = {
  IN_CENTRAL: 'Almoxarifado Central', // Entrada por Transferência da Central
  IN_PURCHASE: 'Compra', // Entrada por Compra
  IN_DONATION: 'Entrada Doação', // Entrada por Doação (Recebida)
  IN_TRANSFER: 'Entrada Transferência', // Entrada por Transferência (Recebida)
  IN_SERVICE_SURPLUS: 'Sobra de Serviço', // Entrada por Sobra de Serviço
  IN_RETURN_FROM_ISSUE: 'Entrada Devolução', // Entrada por Devolução (Saída Revertida)
  INITIAL_STOCK_LOAD: 'Carga Inicial', // Carga Inicial de Estoque
  IN_LOAN_RETURN: 'Entrada Devolução Empréstimo' // Entrada por Devolução de Empréstimo
} as const;

export type TMaterialOperationInKey =
  keyof typeof materialOperationInDisplayMapPorguguese;
export type TMaterialOperationInDisplay =
  (typeof materialOperationInDisplayMapPorguguese)[TMaterialOperationInKey];

// --- 2. Operação: OUT (SAIDA) ---
export const materialOperationOutDisplayMapPorguguese = {
  OUT_SERVICE_USAGE: 'Saída Uso', // Saída para Uso em Serviço
  OUT_EMERGENCY_USAGE: 'Saída Emergência', // Saída de Emergência para Serviço
  OUT_CENTRAL: 'Saída Central', // Saída por Transferência para Central
  OUT_TRANSFER: 'Saída Transferência', // Saída por Transferência (Despachada)
  OUT_DISPOSAL_DAMAGE: 'Saída Descarte Danificado', // Saída por Descarte (Danificado)
  OUT_DISPOSAL_OBSOLETE: 'Saída Descarte Obsoleto', // Saída por Descarte (Obsoleto)
  OUT_EXPIRATION: 'Saída Vencimento', // Saída por Vencimento
  OUT_DONATION: 'Saída Doação', // Saída por Doação (Realizada)
  OUT_LOSS: 'Saída Perda/Roubo', // Saída por Perda/Roubo
  OUT_PROCESSING: 'Saída Beneficiamento', // Saída para beneficiamento
  OUT_LOAN: 'Saída Empréstimo' // Saída por Empréstimo
} as const;

export type TMaterialOperationOutKey =
  keyof typeof materialOperationOutDisplayMapPorguguese;
export type MaterialOperationOutDisplay =
  (typeof materialOperationOutDisplayMapPorguguese)[TMaterialOperationOutKey];

// --- 3. Operação: ADJUSTMENT (AJUSTE) ---
export const materialOperationAdjustmentDisplayMapPorguguese = {
  ADJUSTMENT_INV_IN: 'Ajuste Inventário (Positivo)', // Ajuste de Inventário (Positivo)
  ADJUSTMENT_INV_OUT: 'Ajuste Inventário (Negativo)', // Ajuste de Inventário (Negativo)
  ADJUSTMENT_RECLASSIFY_IN: 'Ajuste Reclassificação (Entrada)', // Ajuste por Reclassificação (Entrada)
  ADJUSTMENT_RECLASSIFY_OUT: 'Ajuste Reclassificação (Saída)' // Ajuste por Reclassificação (Saída)
} as const;

export type TMaterialOperationAdjustmentKey =
  keyof typeof materialOperationAdjustmentDisplayMapPorguguese;
export type MaterialOperationAdjustmentDisplay =
  (typeof materialOperationAdjustmentDisplayMapPorguguese)[TMaterialOperationAdjustmentKey];

// --- 4. Operação: RESERVATION (RESERVA) ---
export const materialOperationReservationDisplayMapPorguguese = {
  RESERVE_FOR_PICKING_ORDER: 'Reserva Ordem de Separação', // Reserva para Ordem de Separação
  RELEASE_PICKING_RESERVATION: 'Liberação Reserva (Ordem de Separação)', // Liberação de Reserva (Ordem de Separação)
  RESERVE_FOR_SPECIFIC_DEMAND: 'Reserva Demanda Específica', // Reserva para Demanda Específica
  RELEASE_SPECIFIC_RESERVATION: 'Liberação Reserva (Demanda Específica)' // Liberação de Reserva (Demanda Específica)
} as const;

export type TMaterialOperationReservationKey =
  keyof typeof materialOperationReservationDisplayMapPorguguese;
export type TMaterialOperationReservationDisplay =
  (typeof materialOperationReservationDisplayMapPorguguese)[TMaterialOperationReservationKey];

// --- 5. Operação: RESTRICTION (RESTRICAO) ---
export const materialOperationRestrictionDisplayMapPorguguese = {
  RESTRICT_FOR_PAID_ITEM: 'Restrição Item Pago', // Restrição para Item Pago
  RELEASE_PAID_RESTRICTION: 'Liberação Restrição (Item Pago)' // Liberação de Restrição (Item Pago)
} as const;

export type TMaterialOperationRestrictionKey =
  keyof typeof materialOperationRestrictionDisplayMapPorguguese;
export type TMaterialOperationRestrictionDisplay =
  (typeof materialOperationRestrictionDisplayMapPorguguese)[TMaterialOperationRestrictionKey];

export const materialOperationTypeDisplayMapPortuguese = {
  IN: 'Entrada',
  OUT: 'Saída',
  ADJUSTMENT: 'Ajuste',
  RESERVATION: 'Reserva',
  RESTRICTION: 'Restrição'
} as const;

export type TMaterialOperationTypeKey =
  keyof typeof materialOperationTypeDisplayMapPortuguese;
export type TMaterialOperationTypeDisplay =
  (typeof materialOperationTypeDisplayMapPortuguese)[TMaterialOperationTypeKey];
