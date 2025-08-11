'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../types/types-server-actions';
import { IRequestAdd, IRequestEdit } from './request-types';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/request';
const API_RELATIVE_PATH = '/material/request';

const logger = new Logger(`${PAGE_PATH}/request-actions`);

export async function getRequests(accessTokenSisman: string) {
  logger.info(`(Server Action) getRequests: Fetching requests`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(`(Server Action) getRequests: ${data.length} requests returned`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) getRequests: Error fetching requests`, error);
    throw error;
  }
}

export async function showRequest(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showRequest: Fetching request ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showRequest: request ${id} returned`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) showRequest: Error fetching request ${id}`, error);
    throw error;
  }
}

export async function getRefreshedRequests() {
  logger.info(`(Server Action) getRefreshedRequests: Revalidating ${PAGE_PATH}`);
  try {
    revalidatePath(PAGE_PATH);
    logger.info(`(Server Action) getRefreshedRequests: Path ${PAGE_PATH} revalidated`);
    return true;
  } catch (error) {
    logger.error(`(Server Action) getRefreshedRequests: Error revalidating path`, error);
  }
}

export async function addRequest(
  prevState: unknown,
  data: IRequestAdd
): Promise<IActionResultForm<IRequestAdd, any>> {
  logger.info(`(Server Action) addRequest: Attempt to add request`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IRequestAdd, any, IRequestAdd>(
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
      'Request added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addRequest: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateRequest(
  prevState: unknown,
  data: IRequestEdit
): Promise<IActionResultForm<IRequestEdit, any>> {
  logger.info(`(Server Action) updateRequest: Attempt to update request ${data.id}`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IRequestEdit, any, IRequestEdit>(
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
      'Request updated successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) updateRequest: Error updating request ${data.id}`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}
