'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { ISpaceTypeAdd, ISpaceTypeEdit } from './space-type-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/space-type';
const API_RELATIVE_PATH = '/infrastructure/space-type';

const logger = new Logger(`${PAGE_PATH}/space-type-actions`);

export async function getSpaceTypes(accessTokenSisman: string) {
  logger.info(`(Server Action) getSpaceTypes: Fetching space-types`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getSpaceTypes: ${data.length} space-types returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getSpaceTypes: Error fetching space-types`,
      error
    );
    throw error;
  }
}

export async function showSpaceType(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showSpaceType: Fetching space-type ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showSpaceType: space-type ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showSpaceType: Error fetching space-type ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedSpaceTypes() {
  logger.info(
    `(Server Action) getRefreshedSpaceTypes: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedSpaceTypes: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedSpaceTypes: Error revalidating path`,
      error
    );
  }
}

export async function addSpaceType(
  prevState: unknown,
  data: ISpaceTypeAdd
): Promise<IActionResultForm<ISpaceTypeAdd, any>> {
  logger.info(`(Server Action) addSpaceType: Attempt to add space-type`, data);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISpaceTypeAdd, any, ISpaceTypeAdd>(
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
      'SpaceType added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addSpaceType: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateSpaceType(
  prevState: unknown,
  data: ISpaceTypeEdit
): Promise<IActionResultForm<ISpaceTypeEdit, any>> {
  logger.info(
    `(Server Action) updateSpaceType: Attempt to update space-type ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISpaceTypeEdit, any, ISpaceTypeEdit>(
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
      'SpaceType updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateSpaceType: Error updating space-type ${data.id}`,
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
