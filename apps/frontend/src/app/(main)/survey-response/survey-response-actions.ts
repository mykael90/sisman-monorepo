'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';
import {
  ISurveyResponseAdd,
  ISurveyResponseWithRelations
} from './survey-response-types';

const PAGE_PATH = '/survey-response';
const API_RELATIVE_PATH = '/survey-response';

// I'm using "any" for the generic type of the API response since the exact structure of a single response isn't explicitly defined,
// but it will be handled by the consuming components which should have the full type.
// For the list, I'm using ISurveyResponseWithRelations[] as the expected return type.

const logger = new Logger(`${PAGE_PATH}/survey-response-actions`);

export async function getSurveyResponses(
  accessTokenSisman: string,
  query?: string
): Promise<ISurveyResponseWithRelations[]> {
  logger.info(`(Server Action) getSurveyResponses: Fetching survey responses`);
  const url = query ? `${API_RELATIVE_PATH}?${query}` : API_RELATIVE_PATH;
  try {
    const data = await fetchApiSisman(url, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getSurveyResponses: ${data.length} responses returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getSurveyResponses: Error fetching survey responses`,
      error
    );
    throw error;
  }
}

export async function getSurveyResponse(
  accessTokenSisman: string,
  id: string
): Promise<ISurveyResponseWithRelations> {
  logger.info(
    `(Server Action) getSurveyResponse: Fetching survey response ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) getSurveyResponse: survey response ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getSurveyResponse: Error fetching survey response ${id}`,
      error
    );
    throw error;
  }
}

export async function addSurveyResponse(
  _prevState: unknown,
  data: ISurveyResponseAdd
): Promise<IActionResultForm<ISurveyResponseAdd, any>> {
  logger.info(
    `(Server Action) addSurveyResponse: Attempt to add survey response`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISurveyResponseAdd, any, ISurveyResponseAdd>(
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
      'Survey response added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addSurveyResponse: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function getRefreshedSurveyResponses() {
  logger.info(
    `(Server Action) getRefreshedSurveyResponses: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedSurveyResponses: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedSurveyResponses: Error revalidating path`,
      error
    );
    throw error;
  }
}

// NOTE: It seems updateSurveyResponse and deleteSurveyResponse are not required based on the provided API requests,
// which only include GET and POST. I've only implemented the actions corresponding to the available
// API endpoints for a generic survey-response module (list, detail, create, and revalidation)
// based on the survey-actions.ts reference.
