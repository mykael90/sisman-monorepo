'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { ISurveyAdd, ISurveyEdit, ISurveyWithRelations } from './survey-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/survey';
const API_RELATIVE_PATH = '/survey';

const logger = new Logger(`${PAGE_PATH}/survey-actions`);

export async function getSurveys(
  query?: string
): Promise<ISurveyWithRelations[]> {
  logger.info(`(Server Action) getSurveys: Fetching surveys`);
  const url = query ? `${API_RELATIVE_PATH}?${query}` : API_RELATIVE_PATH;
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(url, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(`(Server Action) getSurveys: ${data.length} surveys returned`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) getSurveys: Error fetching surveys`, error);
    throw error;
  }
}

export async function getSurvey(
  accessTokenSisman: string,
  id: string
): Promise<ISurveyWithRelations> {
  logger.info(`(Server Action) getSurvey: Fetching survey ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(`(Server Action) getSurvey: survey ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getSurvey: Error fetching survey ${id}`,
      error
    );
    throw error;
  }
}

export async function addSurvey(
  _prevState: unknown,
  data: ISurveyAdd
): Promise<IActionResultForm<ISurveyAdd, any>> {
  logger.info(`(Server Action) addSurvey: Attempt to add survey`, data);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISurveyAdd, any, ISurveyAdd>(
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
      'Survey added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addSurvey: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateSurvey(
  _prevState: unknown,
  data: ISurveyEdit
): Promise<IActionResultForm<ISurveyEdit, any>> {
  logger.info(
    `(Server Action) updateSurvey: Attempt to update survey ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISurveyEdit, any, ISurveyEdit>(
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
      'Survey updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateSurvey: Error updating survey ${data.id}`,
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

export async function deleteSurvey(id: string) {
  logger.info(`(Server Action) deleteSurvey: Deleting survey ${id}`);
  try {
    const accessToken = await getSismanAccessToken();
    await fetchApiSisman(`${API_RELATIVE_PATH}/${id}`, accessToken, {
      method: 'DELETE'
    });
    logger.info(
      `(Server Action) deleteSurvey: survey ${id} deleted, revalidating ${PAGE_PATH}`
    );
    revalidatePath(PAGE_PATH);
    return {
      isSubmitSuccessful: true,
      message: 'Survey deleted successfully!'
    };
  } catch (error) {
    logger.error(
      `(Server Action) deleteSurvey: Error deleting survey ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedSurveys() {
  logger.info(`(Server Action) getRefreshedSurveys: Revalidating ${PAGE_PATH}`);
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedSurveys: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedSurveys: Error revalidating path`,
      error
    );
    throw error;
  }
}
