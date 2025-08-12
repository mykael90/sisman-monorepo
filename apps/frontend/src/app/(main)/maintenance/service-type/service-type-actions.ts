'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import { IServiceTypeAdd, IServiceTypeEdit } from './service-type-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/maintenance/service-type';
const API_RELATIVE_PATH = '/maintenance/service-type';

const logger = new Logger(`${PAGE_PATH}/service-type-actions`);

export async function getServiceTypes(accessTokenSisman: string) {
  logger.info(`(Server Action) getServiceTypes: Fetching service-types`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getServiceTypes: ${data.length} service-types returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getServiceTypes: Error fetching service-types`,
      error
    );
    throw error;
  }
}

export async function showServiceType(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showServiceType: Fetching service-type ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showServiceType: service-type ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showServiceType: Error fetching service-type ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedServiceTypes() {
  logger.info(
    `(Server Action) getRefreshedServiceTypes: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedServiceTypes: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedServiceTypes: Error revalidating path`,
      error
    );
  }
}

export async function addServiceType(
  prevState: unknown,
  data: IServiceTypeAdd
): Promise<IActionResultForm<IServiceTypeAdd, any>> {
  logger.info(
    `(Server Action) addServiceType: Attempt to add service-type`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IServiceTypeAdd, any, IServiceTypeAdd>(
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
      'ServiceType added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addServiceType: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateServiceType(
  prevState: unknown,
  data: IServiceTypeEdit
): Promise<IActionResultForm<IServiceTypeEdit, any>> {
  logger.info(
    `(Server Action) updateServiceType: Attempt to update service-type ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IServiceTypeEdit, any, IServiceTypeEdit>(
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
      'ServiceType updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateServiceType: Error updating service-type ${data.id}`,
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
