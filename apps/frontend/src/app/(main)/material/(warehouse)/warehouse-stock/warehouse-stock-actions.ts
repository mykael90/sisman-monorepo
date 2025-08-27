'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IWarehouseStockAdd,
  IWarehouseStockEdit
} from './warehouse-stock-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/warehouse-stock';
const API_RELATIVE_PATH = '/material-warehouse-stock';

const logger = new Logger(`${PAGE_PATH}/warehouse-stock-actions`);

export async function getWarehouseStocks(warehouseId: number) {
  const accessTokenSisman = await getSismanAccessToken();
  logger.info(`(Server Action) getWarehouseStocks: Fetching warehouse-stocks`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/warehouse/${warehouseId}`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      }
    );
    logger.info(
      `(Server Action) getWarehouseStocks: ${data.length} warehouse-stocks returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWarehouseStocks: Error fetching warehouse-stocks`,
      error
    );
    throw error;
  }
}

export async function getWarehouseStockByWarehouseId(warehouseId: number) {
  const accessTokenSisman = await getSismanAccessToken();
  logger.info(
    `(Server Action) getWarehouseStockByWarehouseId: Fetching warehouse-stock by warehouseId`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/warehouse/${warehouseId}`,
      accessTokenSisman,
      {
        cache: 'force-cache'
      }
    );
    logger.info(
      `(Server Action) getWarehouseStocks: ${data.length} warehouse-stocks returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWarehouseStocks: Error fetching warehouse-stocks`,
      error
    );
    throw error;
  }
}

export async function showWarehouseStock(
  accessTokenSisman: string,
  id: number
) {
  logger.info(
    `(Server Action) showWarehouseStock: Fetching warehouse-stock ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showWarehouseStock: warehouse-stock ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showWarehouseStock: Error fetching warehouse-stock ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedWarehouseStocks() {
  logger.info(
    `(Server Action) getRefreshedWarehouseStocks: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedWarehouseStocks: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedWarehouseStocks: Error revalidating path`,
      error
    );
  }
}

export async function addWarehouseStock(
  prevState: unknown,
  data: IWarehouseStockAdd
): Promise<IActionResultForm<IWarehouseStockAdd, any>> {
  logger.info(
    `(Server Action) addWarehouseStock: Attempt to add warehouse-stock`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IWarehouseStockAdd, any, IWarehouseStockAdd>(
      data,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'WarehouseStock added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addWarehouseStock: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateWarehouseStock(
  prevState: unknown,
  data: IWarehouseStockEdit
): Promise<IActionResultForm<IWarehouseStockEdit, any>> {
  logger.info(
    `(Server Action) updateWarehouseStock: Attempt to update warehouse-stock ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IWarehouseStockEdit, any, IWarehouseStockEdit>(
      data,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/${data.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${data.id}`
      },
      'WarehouseStock updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateWarehouseStock: Error updating warehouse-stock ${data.id}`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}
