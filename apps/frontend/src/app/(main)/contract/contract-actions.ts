'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { IContractAdd, IContractEdit } from './contract-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/contract';
const API_RELATIVE_PATH = '/contracts';

const logger = new Logger(`${PAGE_PATH}/contract-actions`);

export async function getContracts(accessTokenSisman: string) {
  logger.info(`(Server Action) getContracts: Fetching contracts`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getContracts: ${data.length} contracts returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getContracts: Error fetching contracts`,
      error
    );
    throw error;
  }
}

export async function showContract(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showContract: Fetching contract ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showContract: contract ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showContract: Error fetching contract ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedContracts() {
  logger.info(
    `(Server Action) getRefreshedContracts: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedContracts: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedContracts: Error revalidating path`,
      error
    );
    throw error;
  }
}

export async function addContract(
  _prevState: unknown,
  data: IContractAdd
): Promise<IActionResultForm<IContractAdd, any>> {
  logger.info(`(Server Action) addContract: Attempt to add contract`, data);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IContractAdd, any, IContractAdd>(
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
      'Contract added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addContract: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateContract(
  _prevState: unknown,
  data: IContractEdit
): Promise<IActionResultForm<IContractEdit, any>> {
  logger.info(
    `(Server Action) updateContract: Attempt to update contract ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IContractEdit, any, IContractEdit>(
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
      'Contract updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateContract: Error updating contract ${data.id}`,
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
