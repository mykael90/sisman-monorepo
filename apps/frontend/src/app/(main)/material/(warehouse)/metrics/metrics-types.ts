/**
 * Interface para representar as métricas agregadas por código de operação.
 */
export interface ICodeMetrics {
  code: string;
  count: number;
  totalQuantity: string; // Alterado de Decimal para string
  totalValue: string; // Alterado de Decimal para string
}

/**
 * Interface para representar as métricas agregadas por tipo de operação.
 */
export interface IOperationMetrics {
  operation: string;
  operationTotalCount: number;
  operationTotalQuantity: string; // Alterado de Decimal para string
  operationTotalValue: string; // Alterado de Decimal para string
  codes: ICodeMetrics[];
}

/**
 * Interface para representar a resposta agregada de métricas por almoxarifado e material.
 */
export interface IMaterialStockMovementMetricsByWarehouse {
  materialId: string;
  materialName: string;
  totalInCount?: number;
  totalInQuantity?: string; // Alterado de Decimal para string
  totalInValue?: string; // Alterado de Decimal para string
  totalOutCount?: number;
  totalOutQuantity?: string; // Alterado de Decimal para string
  totalOutValue?: string; // Alterado de Decimal para string
  totalAdjustmentCount?: number;
  totalAdjustmentQuantity?: string; // Alterado de Decimal para string
  totalAdjustmentValue?: string; // Alterado de Decimal para string
  totalReservationCount?: number;
  totalReservationQuantity?: string; // Alterado de Decimal para string
  totalReservationValue?: string; // Alterado de Decimal para string
  totalRestrictionCount?: number;
  totalRestrictionQuantity?: string; // Alterado de Decimal para string
  totalRestrictionValue?: string; // Alterado de Decimal para string
  operations: IOperationMetrics[];
}

/**
 * Interface para representar as métricas detalhadas de um mês específico.
 */
export interface IMonthlyMetric {
  year: number;
  month: number;
  count: number;
  totalQuantity: string;
  totalValue: string;
}

/**
 * Interface para representar o agrupamento de operações por tipo contendo a lista de meses.
 */
export interface IOperationByMonth {
  operation: string; // Ex: 'ADJUSTMENT', 'IN', 'OUT', 'RESERVATION'
  months: IMonthlyMetric[];
}

/**
 * Interface principal para a resposta HTTP contendo os dados do material,
 * totais acumulados e o histórico de operações por mês.
 */
export interface IMaterialStockMovementMetricsByWarehouseAndByMaterial {
  materialId: string;
  materialName: string;

  // Totais de Entrada (IN)
  totalInCount: number;
  totalInQuantity: string;
  totalInValue: string;

  // Totais de Saída (OUT)
  totalOutCount: number;
  totalOutQuantity: string;
  totalOutValue: string;

  // Totais de Ajuste (ADJUSTMENT)
  totalAdjustmentCount: number;
  totalAdjustmentQuantity: string;
  totalAdjustmentValue: string;

  // Totais de Reserva (RESERVATION)
  totalReservationCount: number;
  totalReservationQuantity: string;
  totalReservationValue: string;

  // Totais de Restrição (RESTRICTION)
  totalRestrictionCount: number;
  totalRestrictionQuantity: string;
  totalRestrictionValue: string;

  // Lista de operações detalhadas por mês
  operationsByMonth: IOperationByMonth[];
}
