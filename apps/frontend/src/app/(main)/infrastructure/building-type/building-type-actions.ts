'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { IBuildingTypeAdd, IBuildingTypeEdit } from './building-type-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/building-type';
const API_RELATIVE_PATH = '/infrastructure/building-type';

const logger = new Logger(`${PAGE_PATH}/building-type-actions`);

export async function getBuildingTypes(accessTokenSisman: string) {
  logger.info('(Server Action) getBuildingTypes: Fetching building types');
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getBuildingTypes: ${data.length} types returned`
    );
    return data;
  } catch (error) {
    logger.error(
      '(Server Action) getBuildingTypes: Error fetching types',
      error
    );
    throw error;
  }
}

export async function showBuildingType(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showBuildingType: Fetching building type ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showBuildingType: Building type ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showBuildingType: Error fetching type ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedBuildingTypes() {
  logger.info(
    `(Server Action) getRefreshedBuildingTypes: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedBuildingTypes: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedBuildingTypes: Error revalidating path`,
      error
    );
  }
}

export async function addBuildingType(
  prevState: unknown,
  data: IBuildingTypeAdd
): Promise<IActionResultForm<IBuildingTypeAdd, any>> {
  logger.info(
    '(Server Action) addBuildingType: Attempt to add building type',
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IBuildingTypeAdd, any, IBuildingTypeAdd>(
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
      'Building type added successfully!'
    );
  } catch (error) {
    logger.error('(Server Action) addBuildingType: Unexpected error', error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateBuildingType(
  prevState: unknown,
  data: IBuildingTypeEdit
): Promise<IActionResultForm<IBuildingTypeEdit, any>> {
  logger.info(
    `(Server Action) updateBuildingType: Attempt to update building type ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IBuildingTypeEdit, any, IBuildingTypeEdit>(
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
      'Building type updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateBuildingType: Error updating type ${data.id}`,
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
