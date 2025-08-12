'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import { IPickingOrderAdd, IPickingOrderEdit } from './picking-order-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/picking-order';
const API_RELATIVE_PATH = '/material/picking-order';

const logger = new Logger(`${PAGE_PATH}/picking-order-actions`);

export async function getPickingOrders(accessTokenSisman: string) {
  logger.info(`(Server Action) getPickingOrders: Fetching picking-orders`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getPickingOrders: ${data.length} picking-orders returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getPickingOrders: Error fetching picking-orders`,
      error
    );
    throw error;
  }
}

export async function showPickingOrder(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showPickingOrder: Fetching picking-order ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showPickingOrder: picking-order ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showPickingOrder: Error fetching picking-order ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedPickingOrders() {
  logger.info(
    `(Server Action) getRefreshedPickingOrders: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedPickingOrders: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedPickingOrders: Error revalidating path`,
      error
    );
  }
}

export async function addPickingOrder(
  prevState: unknown,
  data: IPickingOrderAdd
): Promise<IActionResultForm<IPickingOrderAdd, any>> {
  logger.info(
    `(Server Action) addPickingOrder: Attempt to add picking-order`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IPickingOrderAdd, any, IPickingOrderAdd>(
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
      'PickingOrder added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addPickingOrder: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updatePickingOrder(
  prevState: unknown,
  data: IPickingOrderEdit
): Promise<IActionResultForm<IPickingOrderEdit, any>> {
  logger.info(
    `(Server Action) updatePickingOrder: Attempt to update picking-order ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IPickingOrderEdit, any, IPickingOrderEdit>(
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
      'PickingOrder updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updatePickingOrder: Error updating picking-order ${data.id}`,
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
