'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IStockMovementAdd,
  IStockMovementCountAdd,
  IStockMovementEdit,
  IStockMovementWithRelations
} from './stock-movement-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/stock-movement';
const API_RELATIVE_PATH = '/material-stock-movement';

const logger = new Logger(`${PAGE_PATH}/stock-movement-actions`);

export async function getStockMovements(accessTokenSisman: string) {
  logger.info(`(Server Action) getStockMovements: Fetching stock-movements`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getStockMovements: ${data.length} stock-movements returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getStockMovements: Error fetching stock-movements`,
      error
    );
    throw error;
  }
}
export async function getStockMovementsByWarehouseAndMaterial(
  warehouseId: number,
  globalMaterialId: string
) {
  logger.info(`(Server Action) getStockMovements: Fetching stock-movements`);
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/warehouse/${warehouseId}`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      },
      {
        globalMaterialId: globalMaterialId
      }
    );
    logger.info(
      `(Server Action) getStockMovements: ${data.length} stock-movements returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getStockMovements: Error fetching stock-movements`,
      error
    );
    throw error;
  }
}

export async function showStockMovement(accessTokenSisman: string, id: number) {
  logger.info(
    `(Server Action) showStockMovement: Fetching stock-movement ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showStockMovement: stock-movement ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showStockMovement: Error fetching stock-movement ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedStockMovements() {
  logger.info(
    `(Server Action) getRefreshedStockMovements: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedStockMovements: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedStockMovements: Error revalidating path`,
      error
    );
  }
}

export async function addStockMovement(
  prevState: unknown,
  data: IStockMovementAdd
): Promise<IActionResultForm<IStockMovementAdd, any>> {
  logger.info(
    `(Server Action) addStockMovement: Attempt to add stock-movement`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IStockMovementAdd, any, IStockMovementAdd>(
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
      'StockMovement added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addStockMovement: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateStockMovement(
  prevState: unknown,
  data: IStockMovementEdit
): Promise<IActionResultForm<IStockMovementEdit, any>> {
  logger.info(
    `(Server Action) updateStockMovement: Attempt to update stock-movement ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IStockMovementEdit, any, IStockMovementEdit>(
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
      'StockMovement updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateStockMovement: Error updating stock-movement ${data.id}`,
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

export async function addStockMovementCount(
  prevState: unknown,
  data: IStockMovementCountAdd
): Promise<
  IActionResultForm<IStockMovementCountAdd, IStockMovementWithRelations>
> {
  logger.info(
    `(Server Action) addStockMovementCount: Attempt to add stock-movement counting`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IStockMovementCountAdd,
      IStockMovementWithRelations,
      IStockMovementCountAdd
    >(
      data,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/count`,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'StockMovement Counting added successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addStockMovement Counting: Unexpected error`,
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
