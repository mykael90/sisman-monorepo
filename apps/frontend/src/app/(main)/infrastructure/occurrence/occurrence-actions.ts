'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import { IOccurrenceAdd, IOccurrenceEdit } from './occurrence-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/occurrence';
const API_RELATIVE_PATH = '/infrastructure/occurrence';

const logger = new Logger(`${PAGE_PATH}/occurrence-actions`);

export async function getOccurrences(accessTokenSisman: string) {
  logger.info(`(Server Action) getOccurrences: Fetching occurrences`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getOccurrences: ${data.length} occurrences returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getOccurrences: Error fetching occurrences`,
      error
    );
    throw error;
  }
}

export async function showOccurrence(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showOccurrence: Fetching occurrence ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showOccurrence: occurrence ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showOccurrence: Error fetching occurrence ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedOccurrences() {
  logger.info(
    `(Server Action) getRefreshedOccurrences: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedOccurrences: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedOccurrences: Error revalidating path`,
      error
    );
  }
}

export async function addOccurrence(
  prevState: unknown,
  data: IOccurrenceAdd
): Promise<IActionResultForm<IOccurrenceAdd, any>> {
  logger.info(`(Server Action) addOccurrence: Attempt to add occurrence`, data);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IOccurrenceAdd, any, IOccurrenceAdd>(
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
      'Occurrence added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addOccurrence: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateOccurrence(
  prevState: unknown,
  data: IOccurrenceEdit
): Promise<IActionResultForm<IOccurrenceEdit, any>> {
  logger.info(
    `(Server Action) updateOccurrence: Attempt to update occurrence ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IOccurrenceEdit, any, IOccurrenceEdit>(
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
      'Occurrence updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateOccurrence: Error updating occurrence ${data.id}`,
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
