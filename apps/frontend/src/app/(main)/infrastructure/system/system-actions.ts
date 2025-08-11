'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../types/types-server-actions';
import { ISystemAdd, ISystemEdit } from './system-types';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/system';
const API_RELATIVE_PATH = '/infrastructure/system';

const logger = new Logger(`${PAGE_PATH}/system-actions`);

export async function getSystems(accessTokenSisman: string) {
  logger.info(`(Server Action) getSystems: Fetching systems`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(`(Server Action) getSystems: ${data.length} systems returned`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) getSystems: Error fetching systems`, error);
    throw error;
  }
}

export async function showSystem(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showSystem: Fetching system ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showSystem: system ${id} returned`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) showSystem: Error fetching system ${id}`, error);
    throw error;
  }
}

export async function getRefreshedSystems() {
  logger.info(`(Server Action) getRefreshedSystems: Revalidating ${PAGE_PATH}`);
  try {
    revalidatePath(PAGE_PATH);
    logger.info(`(Server Action) getRefreshedSystems: Path ${PAGE_PATH} revalidated`);
    return true;
  } catch (error) {
    logger.error(`(Server Action) getRefreshedSystems: Error revalidating path`, error);
  }
}

export async function addSystem(
  prevState: unknown,
  data: ISystemAdd
): Promise<IActionResultForm<ISystemAdd, any>> {
  logger.info(`(Server Action) addSystem: Attempt to add system`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISystemAdd, any, ISystemAdd>(
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
      'System added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addSystem: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateSystem(
  prevState: unknown,
  data: ISystemEdit
): Promise<IActionResultForm<ISystemEdit, any>> {
  logger.info(`(Server Action) updateSystem: Attempt to update system ${data.id}`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISystemEdit, any, ISystemEdit>(
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
      'System updated successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) updateSystem: Error updating system ${data.id}`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}
