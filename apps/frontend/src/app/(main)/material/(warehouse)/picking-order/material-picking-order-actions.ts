'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderAddPayload,
  IMaterialPickingOrderEdit,
  IMaterialPickingOrderWithRelations
} from './material-picking-order-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';
import { pickingorderServiceUsageMapping } from './add/mapper-to-payload';
import { createPayload } from '../../../../../lib/payload-creator';
import { TMaterialPickingOrderStatusDisplay } from '../../../../../mappers/material-picking-order-mappers';
import { materialPickingOrderStatusDisplayMapPortuguese } from '../../../../../mappers/material-picking-order-mappers-translate';

const PAGE_PATH = '/material/picking-order';
const API_RELATIVE_PATH = '/material-picking-order';

const logger = new Logger(`${PAGE_PATH}/picking-order-actions`);

export async function getMaterialPickingOrders(accessTokenSisman: string) {
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

export async function getMaterialPickingOrdersByWarehouse(
  warehouseId: number,
  params?: { from?: Date; to?: Date }
) {
  logger.info(
    `(Server Action) getPickingOrdersByWarehouse: Fetching picking-orders for warehouse ${warehouseId} with date range`,
    params
  );

  const urlParams = new URLSearchParams();
  if (params?.from) {
    urlParams.append('startDate', params.from.toISOString());
  }

  if (params?.to) {
    urlParams.append('endDate', params.to.toISOString());
  }

  console.log(urlParams.toString());

  try {
    const accessToken = await getSismanAccessToken();

    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/warehouse/${warehouseId}`,
      accessToken,
      { cache: 'no-store' },
      {
        startDate: urlParams.get('startDate'),
        endDate: urlParams.get('endDate')
      }
    );
    logger.info(
      `(Server Action) getPickingOrdersByWarehouse: ${data.length} picking-orders returned for warehouse ${warehouseId}`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getPickingOrdersByWarehouse: Error fetching picking-orders for warehouse ${warehouseId}`,
      error
    );
    throw error;
  }
}

export async function showMaterialPickingOrder(
  accessTokenSisman: string,
  id: number
) {
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

export async function getRefreshedMaterialPickingOrders() {
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

export async function addMaterialPickingOrder(
  prevState: unknown,
  data: IMaterialPickingOrderAddForm
): Promise<
  IActionResultForm<
    IMaterialPickingOrderAddForm,
    IMaterialPickingOrderWithRelations
  >
> {
  logger.info(
    `(Server Action) addPickingOrder: Attempt to add picking-order`,
    data
  );

  //Precisa construir o payload, formulario complexo
  const payload = createPayload(data, pickingorderServiceUsageMapping);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialPickingOrderAddPayload,
      IMaterialPickingOrderWithRelations,
      IMaterialPickingOrderAddForm
    >(
      payload,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Reserva cadastrada com sucesso!'
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

export async function updateMaterialPickingOrderStatusByOperation(
  id: number,
  status: TMaterialPickingOrderStatusDisplay,
  userId: number
): Promise<IActionResultForm<any, any>> {
  logger.info(
    `(Server Action) updateMaterialPickingOrderStatus: Attempt to update picking-order ${id} status to ${status} by user ${userId}`
  );

  const payload = {
    userId,
    status
  };

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<any, any, any>(
      payload,
      payload,
      {
        endpoint: `${API_RELATIVE_PATH}/operation-by-status/${id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${id}`
      },
      `Status da reserva id: ${id} atualizado para ${materialPickingOrderStatusDisplayMapPortuguese[status]} com sucesso!`
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateMaterialPickingOrderStatus: Error updating picking-order ${id} status`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: payload,
      message: 'Unexpected error'
    };
  }
}

export async function updateMaterialPickingOrder(
  prevState: unknown,
  data: IMaterialPickingOrderEdit
): Promise<IActionResultForm<IMaterialPickingOrderEdit, any>> {
  logger.info(
    `(Server Action) updatePickingOrder: Attempt to update picking-order ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialPickingOrderEdit,
      any,
      IMaterialPickingOrderEdit
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
