'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IBuildingActivityAdd,
  IBuildingActivityEdit
} from './building-activity-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/building-activity';
const API_RELATIVE_PATH = '/infrastructure/building-activity';

const logger = new Logger(`${PAGE_PATH}/building-activity-actions`);

export async function getBuildingActivities(accessTokenSisman: string) {
  logger.info(
    '(Server Action) getBuildingActivities: Fetching building activities'
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getBuildingActivities: ${data.length} activities returned`
    );
    return data;
  } catch (error) {
    logger.error(
      '(Server Action) getBuildingActivities: Error fetching activities',
      error
    );
    throw error;
  }
}

export async function showBuildingActivity(
  accessTokenSisman: string,
  id: number
) {
  logger.info(
    `(Server Action) showBuildingActivity: Fetching building activity ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showBuildingActivity: Building activity ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showBuildingActivity: Error fetching activity ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedBuildingActivities() {
  logger.info(
    `(Server Action) getRefreshedBuildingActivities: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedBuildingActivities: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedBuildingActivities: Error revalidating path`,
      error
    );
  }
}

export async function addBuildingActivity(
  prevState: unknown,
  data: IBuildingActivityAdd
): Promise<IActionResultForm<IBuildingActivityAdd, any>> {
  logger.info(
    '(Server Action) addBuildingActivity: Attempt to add building activity',
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IBuildingActivityAdd,
      any,
      IBuildingActivityAdd
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
      'Building activity added successfully!'
    );
  } catch (error) {
    logger.error(
      '(Server Action) addBuildingActivity: Unexpected error',
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

export async function updateBuildingActivity(
  prevState: unknown,
  data: IBuildingActivityEdit
): Promise<IActionResultForm<IBuildingActivityEdit, any>> {
  logger.info(
    `(Server Action) updateBuildingActivity: Attempt to update building activity ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IBuildingActivityEdit,
      any,
      IBuildingActivityEdit
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
      'Building activity updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateBuildingActivity: Error updating activity ${data.id}`,
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
