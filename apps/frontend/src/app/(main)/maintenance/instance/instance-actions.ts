'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaintenanceInstanceAdd,
  IMaintenanceInstanceEdit
} from './instance-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/maintenance/instance';
const API_RELATIVE_PATH = '/maintenance-instance';

const logger = new Logger(`${PAGE_PATH}/instance-actions`);

export async function getMaintenanceInstances(accessTokenSisman: string) {
  logger.info(`(Server Action) getInstances: Fetching instances`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getInstances: ${data.length} instances returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getInstances: Error fetching instances`,
      error
    );
    throw error;
  }
}

export async function showInstance(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showInstance: Fetching instance ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showInstance: instance ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showInstance: Error fetching instance ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedInstances() {
  logger.info(
    `(Server Action) getRefreshedInstances: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedInstances: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedInstances: Error revalidating path`,
      error
    );
    throw error;
  }
}

export async function addInstance(
  _prevState: unknown,
  data: IMaintenanceInstanceAdd
): Promise<IActionResultForm<IMaintenanceInstanceAdd, any>> {
  logger.info(`(Server Action) addInstance: Attempt to add instance`, data);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaintenanceInstanceAdd,
      any,
      IMaintenanceInstanceAdd
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
      'Instance added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addInstance: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateInstance(
  _prevState: unknown,
  data: IMaintenanceInstanceEdit
): Promise<IActionResultForm<IMaintenanceInstanceEdit, any>> {
  logger.info(
    `(Server Action) updateInstance: Attempt to update instance ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaintenanceInstanceEdit,
      any,
      IMaintenanceInstanceEdit
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
      'Instance updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateInstance: Error updating instance ${data.id}`,
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
