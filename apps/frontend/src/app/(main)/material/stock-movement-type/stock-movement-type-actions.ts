'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IStockMovementTypeAdd,
  IStockMovementTypeEdit
} from './stock-movement-type-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/stock-movement-type';
const API_RELATIVE_PATH = '/material/stock-movement-type';

const logger = new Logger(`${PAGE_PATH}/stock-movement-type-actions`);

export async function getStockMovementTypes(accessTokenSisman: string) {
  logger.info(
    `(Server Action) getStockMovementTypes: Fetching stock-movement-types`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getStockMovementTypes: ${data.length} stock-movement-types returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getStockMovementTypes: Error fetching stock-movement-types`,
      error
    );
    throw error;
  }
}

export async function showStockMovementType(
  accessTokenSisman: string,
  id: number
) {
  logger.info(
    `(Server Action) showStockMovementType: Fetching stock-movement-type ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showStockMovementType: stock-movement-type ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showStockMovementType: Error fetching stock-movement-type ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedStockMovementTypes() {
  logger.info(
    `(Server Action) getRefreshedStockMovementTypes: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedStockMovementTypes: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedStockMovementTypes: Error revalidating path`,
      error
    );
  }
}

export async function addStockMovementType(
  prevState: unknown,
  data: IStockMovementTypeAdd
): Promise<IActionResultForm<IStockMovementTypeAdd, any>> {
  logger.info(
    `(Server Action) addStockMovementType: Attempt to add stock-movement-type`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IStockMovementTypeAdd,
      any,
      IStockMovementTypeAdd
    >(
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
      'StockMovementType added successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addStockMovementType: Unexpected error`,
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

export async function updateStockMovementType(
  prevState: unknown,
  data: IStockMovementTypeEdit
): Promise<IActionResultForm<IStockMovementTypeEdit, any>> {
  logger.info(
    `(Server Action) updateStockMovementType: Attempt to update stock-movement-type ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IStockMovementTypeEdit,
      any,
      IStockMovementTypeEdit
    >(
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
      'StockMovementType updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateStockMovementType: Error updating stock-movement-type ${data.id}`,
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
