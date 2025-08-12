'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import {
  IRestrictionOrderAdd,
  IRestrictionOrderEdit
} from './restriction-order-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/restriction-order';
const API_RELATIVE_PATH = '/material/restriction-order';

const logger = new Logger(`${PAGE_PATH}/restriction-order-actions`);

export async function getRestrictionOrders(accessTokenSisman: string) {
  logger.info(
    `(Server Action) getRestrictionOrders: Fetching restriction-orders`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getRestrictionOrders: ${data.length} restriction-orders returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getRestrictionOrders: Error fetching restriction-orders`,
      error
    );
    throw error;
  }
}

export async function showRestrictionOrder(
  accessTokenSisman: string,
  id: number
) {
  logger.info(
    `(Server Action) showRestrictionOrder: Fetching restriction-order ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showRestrictionOrder: restriction-order ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showRestrictionOrder: Error fetching restriction-order ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedRestrictionOrders() {
  logger.info(
    `(Server Action) getRefreshedRestrictionOrders: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedRestrictionOrders: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedRestrictionOrders: Error revalidating path`,
      error
    );
  }
}

export async function addRestrictionOrder(
  prevState: unknown,
  data: IRestrictionOrderAdd
): Promise<IActionResultForm<IRestrictionOrderAdd, any>> {
  logger.info(
    `(Server Action) addRestrictionOrder: Attempt to add restriction-order`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IRestrictionOrderAdd,
      any,
      IRestrictionOrderAdd
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
      'RestrictionOrder added successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addRestrictionOrder: Unexpected error`,
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

export async function updateRestrictionOrder(
  prevState: unknown,
  data: IRestrictionOrderEdit
): Promise<IActionResultForm<IRestrictionOrderEdit, any>> {
  logger.info(
    `(Server Action) updateRestrictionOrder: Attempt to update restriction-order ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IRestrictionOrderEdit,
      any,
      IRestrictionOrderEdit
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
      'RestrictionOrder updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateRestrictionOrder: Error updating restriction-order ${data.id}`,
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
