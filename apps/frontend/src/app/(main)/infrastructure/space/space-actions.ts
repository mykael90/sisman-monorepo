'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../types/types-server-actions';
import { ISpaceAdd, ISpaceEdit } from './space-types';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/space';
const API_RELATIVE_PATH = '/infrastructure/space';

const logger = new Logger(`${PAGE_PATH}/space-actions`);

export async function getSpaces(accessTokenSisman: string) {
  logger.info(`(Server Action) getSpaces: Fetching spaces`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(`(Server Action) getSpaces: ${data.length} spaces returned`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) getSpaces: Error fetching spaces`, error);
    throw error;
  }
}

export async function showSpace(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showSpace: Fetching space ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showSpace: space ${id} returned`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) showSpace: Error fetching space ${id}`, error);
    throw error;
  }
}

export async function getRefreshedSpaces() {
  logger.info(`(Server Action) getRefreshedSpaces: Revalidating ${PAGE_PATH}`);
  try {
    revalidatePath(PAGE_PATH);
    logger.info(`(Server Action) getRefreshedSpaces: Path ${PAGE_PATH} revalidated`);
    return true;
  } catch (error) {
    logger.error(`(Server Action) getRefreshedSpaces: Error revalidating path`, error);
  }
}

export async function addSpace(
  prevState: unknown,
  data: ISpaceAdd
): Promise<IActionResultForm<ISpaceAdd, any>> {
  logger.info(`(Server Action) addSpace: Attempt to add space`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISpaceAdd, any, ISpaceAdd>(
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
      'Space added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addSpace: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateSpace(
  prevState: unknown,
  data: ISpaceEdit
): Promise<IActionResultForm<ISpaceEdit, any>> {
  logger.info(`(Server Action) updateSpace: Attempt to update space ${data.id}`, data);
  
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISpaceEdit, any, ISpaceEdit>(
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
      'Space updated successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) updateSpace: Error updating space ${data.id}`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}
