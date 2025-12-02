'use server';

import Logger from '@/lib/logger';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IMaterialStockMovementMetricsByWarehouse } from './metrics-types';

const PAGE_PATH = '/material/warehouse-stock';

const logger = new Logger(`${PAGE_PATH}/metrics`);

export async function getMaterialStockMovementMetricsByWarehouseId(
  warehouseId: number,
  params?: { from?: Date; to?: Date }
): Promise<IMaterialStockMovementMetricsByWarehouse[]> {
  const urlParams = new URLSearchParams();
  if (params?.from) {
    urlParams.append('startDate', params.from.toISOString());
  }

  if (params?.to) {
    urlParams.append('endDate', params.to.toISOString());
  }

  console.log(urlParams.toString());

  try {
    const accessTokenSisman = await getSismanAccessToken();
    logger.info(
      `(Server Action) getMaterialStockMovementMetricsByWarehouseId: Fetching metrics from material's movements by warehouseId with date range`
    );

    const data = await fetchApiSisman(
      `material-stock-movement/metrics/warehouse/${warehouseId}`,
      accessTokenSisman,
      { cache: 'no-store' },
      {
        startDate: urlParams.get('startDate'),
        endDate: urlParams.get('endDate')
      }
    );
    logger.info(
      `(Server Action) getMaterialStockMovementMetricsByWarehouseId: ${data.length} materials returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWarehouseStocks: Error fetching StockMovementMetrics`,
      error
    );
    throw error;
  }
}
