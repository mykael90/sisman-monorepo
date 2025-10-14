'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { IBuildingAdd, IBuildingEdit } from './building-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/building';
const API_RELATIVE_PATH = '/infrastructure/building';

const logger = new Logger(`${PAGE_PATH}/building-actions`);

export async function getBuildings(accessTokenSisman: string) {
  logger.info('(Server Action) getBuildings: Fetching buildings');
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getBuildings: ${data.length} buildings returned`
    );
    return data;
  } catch (error) {
    logger.error(
      '(Server Action) getBuildings: Error fetching buildings',
      error
    );
    throw error;
  }
}

export async function showBuilding(accessTokenSisman: string, id: string) {
  logger.info(`(Server Action) showBuilding: Fetching building ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showBuilding: Building ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showBuilding: Error fetching building ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedBuildings() {
  logger.info(
    `(Server Action) getRefreshedBuildings: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedBuildings: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedBuildings: Error revalidating path`,
      error
    );
  }
}

export async function addBuilding(
  prevState: unknown,
  data: IBuildingAdd
): Promise<IActionResultForm<IBuildingAdd, any>> {
  logger.info('(Server Action) addBuilding: Attempt to add building', data);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IBuildingAdd, any, IBuildingAdd>(
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
      'Building added successfully!'
    );
  } catch (error) {
    logger.error('(Server Action) addBuilding: Unexpected error', error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateBuilding(
  prevState: unknown,
  data: IBuildingEdit
): Promise<IActionResultForm<IBuildingEdit, any>> {
  logger.info(
    `(Server Action) updateBuilding: Attempt to update building ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IBuildingEdit, any, IBuildingEdit>(
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
      'Building updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateBuilding: Error updating building ${data.id}`,
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
