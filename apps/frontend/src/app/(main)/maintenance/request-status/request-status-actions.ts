'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import { IRequestStatusAdd, IRequestStatusEdit } from './request-status-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/maintenance/request-status';
const API_RELATIVE_PATH = '/maintenance/request-status';

const logger = new Logger(`${PAGE_PATH}/request-status-actions`);

export async function getRequestStatuss(accessTokenSisman: string) {
  logger.info(`(Server Action) getRequestStatuss: Fetching request-statuss`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getRequestStatuss: ${data.length} request-statuss returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getRequestStatuss: Error fetching request-statuss`,
      error
    );
    throw error;
  }
}

export async function showRequestStatus(accessTokenSisman: string, id: number) {
  logger.info(
    `(Server Action) showRequestStatus: Fetching request-status ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showRequestStatus: request-status ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showRequestStatus: Error fetching request-status ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedRequestStatuss() {
  logger.info(
    `(Server Action) getRefreshedRequestStatuss: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedRequestStatuss: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedRequestStatuss: Error revalidating path`,
      error
    );
  }
}

export async function addRequestStatus(
  prevState: unknown,
  data: IRequestStatusAdd
): Promise<IActionResultForm<IRequestStatusAdd, any>> {
  logger.info(
    `(Server Action) addRequestStatus: Attempt to add request-status`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IRequestStatusAdd, any, IRequestStatusAdd>(
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
      'RequestStatus added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addRequestStatus: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateRequestStatus(
  prevState: unknown,
  data: IRequestStatusEdit
): Promise<IActionResultForm<IRequestStatusEdit, any>> {
  logger.info(
    `(Server Action) updateRequestStatus: Attempt to update request-status ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IRequestStatusEdit, any, IRequestStatusEdit>(
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
      'RequestStatus updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateRequestStatus: Error updating request-status ${data.id}`,
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
