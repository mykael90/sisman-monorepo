'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IFacilityComplexAdd,
  IFacilityComplexEdit
} from './facility-complex-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/infrastructure/facility-complex';
const API_RELATIVE_PATH = '/infrastructure/facility-complex';

const logger = new Logger(`${PAGE_PATH}/facility-complex-actions`);

export async function getFacilityComplexes(accessTokenSisman: string) {
  logger.info(
    '(Server Action) getFacilityComplexes: Fetching facility complexes'
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getFacilityComplexes: ${data.length} complexes returned`
    );
    return data;
  } catch (error) {
    logger.error(
      '(Server Action) getFacilityComplexes: Error fetching complexes',
      error
    );
    throw error;
  }
}

export async function showFacilityComplex(
  accessTokenSisman: string,
  id: string
) {
  logger.info(
    `(Server Action) showFacilityComplex: Fetching facility complex ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showFacilityComplex: Facility complex ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showFacilityComplex: Error fetching complex ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedFacilityComplexes() {
  logger.info(
    `(Server Action) getRefreshedFacilityComplexes: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedFacilityComplexes: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedFacilityComplexes: Error revalidating path`,
      error
    );
  }
}

export async function addFacilityComplex(
  prevState: unknown,
  data: IFacilityComplexAdd
): Promise<IActionResultForm<IFacilityComplexAdd, any>> {
  logger.info(
    '(Server Action) addFacilityComplex: Attempt to add facility complex',
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IFacilityComplexAdd, any, IFacilityComplexAdd>(
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
      'Facility complex added successfully!'
    );
  } catch (error) {
    logger.error('(Server Action) addFacilityComplex: Unexpected error', error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateFacilityComplex(
  prevState: unknown,
  data: IFacilityComplexEdit
): Promise<IActionResultForm<IFacilityComplexEdit, any>> {
  logger.info(
    `(Server Action) updateFacilityComplex: Attempt to update facility complex ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IFacilityComplexEdit,
      any,
      IFacilityComplexEdit
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
      'Facility complex updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateFacilityComplex: Error updating complex ${data.id}`,
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
