'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IOccurrenceReinforcementAdd,
  IOccurrenceReinforcementEdit
} from './occurrence-reinforcement-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/occurrence-reinforcement';
const API_RELATIVE_PATH = '/infrastructure/occurrence-reinforcement';

const logger = new Logger(`${PAGE_PATH}/occurrence-reinforcement-actions`);

export async function getOccurrenceReinforcements(accessTokenSisman: string) {
  logger.info(
    `(Server Action) getOccurrenceReinforcements: Fetching occurrence-reinforcements`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getOccurrenceReinforcements: ${data.length} occurrence-reinforcements returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getOccurrenceReinforcements: Error fetching occurrence-reinforcements`,
      error
    );
    throw error;
  }
}

export async function showOccurrenceReinforcement(
  accessTokenSisman: string,
  id: number
) {
  logger.info(
    `(Server Action) showOccurrenceReinforcement: Fetching occurrence-reinforcement ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showOccurrenceReinforcement: occurrence-reinforcement ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showOccurrenceReinforcement: Error fetching occurrence-reinforcement ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedOccurrenceReinforcements() {
  logger.info(
    `(Server Action) getRefreshedOccurrenceReinforcements: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedOccurrenceReinforcements: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedOccurrenceReinforcements: Error revalidating path`,
      error
    );
  }
}

export async function addOccurrenceReinforcement(
  prevState: unknown,
  data: IOccurrenceReinforcementAdd
): Promise<IActionResultForm<IOccurrenceReinforcementAdd, any>> {
  logger.info(
    `(Server Action) addOccurrenceReinforcement: Attempt to add occurrence-reinforcement`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IOccurrenceReinforcementAdd,
      any,
      IOccurrenceReinforcementAdd
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
      'OccurrenceReinforcement added successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addOccurrenceReinforcement: Unexpected error`,
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

export async function updateOccurrenceReinforcement(
  prevState: unknown,
  data: IOccurrenceReinforcementEdit
): Promise<IActionResultForm<IOccurrenceReinforcementEdit, any>> {
  logger.info(
    `(Server Action) updateOccurrenceReinforcement: Attempt to update occurrence-reinforcement ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IOccurrenceReinforcementEdit,
      any,
      IOccurrenceReinforcementEdit
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
      'OccurrenceReinforcement updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateOccurrenceReinforcement: Error updating occurrence-reinforcement ${data.id}`,
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
