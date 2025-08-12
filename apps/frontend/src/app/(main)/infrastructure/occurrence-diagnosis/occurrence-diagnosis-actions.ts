'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import {
  IOccurrenceDiagnosisAdd,
  IOccurrenceDiagnosisEdit
} from './occurrence-diagnosis-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/occurrence-diagnosis';
const API_RELATIVE_PATH = '/infrastructure/occurrence-diagnosis';

const logger = new Logger(`${PAGE_PATH}/occurrence-diagnosis-actions`);

export async function getOccurrenceDiagnosiss(accessTokenSisman: string) {
  logger.info(
    `(Server Action) getOccurrenceDiagnosiss: Fetching occurrence-diagnosiss`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getOccurrenceDiagnosiss: ${data.length} occurrence-diagnosiss returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getOccurrenceDiagnosiss: Error fetching occurrence-diagnosiss`,
      error
    );
    throw error;
  }
}

export async function showOccurrenceDiagnosis(
  accessTokenSisman: string,
  id: number
) {
  logger.info(
    `(Server Action) showOccurrenceDiagnosis: Fetching occurrence-diagnosis ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showOccurrenceDiagnosis: occurrence-diagnosis ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showOccurrenceDiagnosis: Error fetching occurrence-diagnosis ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedOccurrenceDiagnosiss() {
  logger.info(
    `(Server Action) getRefreshedOccurrenceDiagnosiss: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedOccurrenceDiagnosiss: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedOccurrenceDiagnosiss: Error revalidating path`,
      error
    );
  }
}

export async function addOccurrenceDiagnosis(
  prevState: unknown,
  data: IOccurrenceDiagnosisAdd
): Promise<IActionResultForm<IOccurrenceDiagnosisAdd, any>> {
  logger.info(
    `(Server Action) addOccurrenceDiagnosis: Attempt to add occurrence-diagnosis`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IOccurrenceDiagnosisAdd,
      any,
      IOccurrenceDiagnosisAdd
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
      'OccurrenceDiagnosis added successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addOccurrenceDiagnosis: Unexpected error`,
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

export async function updateOccurrenceDiagnosis(
  prevState: unknown,
  data: IOccurrenceDiagnosisEdit
): Promise<IActionResultForm<IOccurrenceDiagnosisEdit, any>> {
  logger.info(
    `(Server Action) updateOccurrenceDiagnosis: Attempt to update occurrence-diagnosis ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IOccurrenceDiagnosisEdit,
      any,
      IOccurrenceDiagnosisEdit
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
      'OccurrenceDiagnosis updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateOccurrenceDiagnosis: Error updating occurrence-diagnosis ${data.id}`,
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
