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
