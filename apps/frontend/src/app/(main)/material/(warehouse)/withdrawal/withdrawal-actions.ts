'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaterialWithdrawalAdd,
  IMaterialWithdrawalAddWithRelations,
  IMaterialWithdrawalEdit,
  IMaterialWithdrawalWithRelations
} from './withdrawal-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';
import { createPayload } from '@/lib/payload-creator';
import { withdrawalServiceUsageMapping } from './add/OUT_SERVICE_USAGE/components/mapper-to-payload';
import { IMaterialWithdrawalAddForm } from './_components/form/material-withdrawal-form-add';

const PAGE_PATH = '/material/withdrawal';
const API_RELATIVE_PATH = '/material-withdrawal';

const logger = new Logger(`${PAGE_PATH}/withdrawal-actions`);

export async function getWithdrawals(accessTokenSisman: string) {
  logger.info(`(Server Action) getWithdrawals: Fetching withdrawals`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getWithdrawals: ${data.length} withdrawals returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWithdrawals: Error fetching withdrawals`,
      error
    );
    throw error;
  }
}

export async function showWithdrawal(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showWithdrawal: Fetching withdrawal ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showWithdrawal: withdrawal ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showWithdrawal: Error fetching withdrawal ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedWithdrawals() {
  logger.info(
    `(Server Action) getRefreshedWithdrawals: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedWithdrawals: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedWithdrawals: Error revalidating path`,
      error
    );
  }
}

export async function addWithdrawal(
  prevState: unknown,
  data: IMaterialWithdrawalAddForm
): Promise<
  IActionResultForm<
    IMaterialWithdrawalAddForm,
    IMaterialWithdrawalWithRelations
  >
> {
  logger.info(`(Server Action) addWithdrawal: Attempt to add withdrawal`, data);

  //Precisa construir o payload, formulario complexo
  const payload = createPayload(data, withdrawalServiceUsageMapping);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialWithdrawalAddWithRelations,
      IMaterialWithdrawalWithRelations,
      IMaterialWithdrawalAddForm
    >(
      payload,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Withdrawal added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addWithdrawal: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateWithdrawal(
  prevState: unknown,
  data: IMaterialWithdrawalEdit
): Promise<IActionResultForm<IMaterialWithdrawalEdit, any>> {
  logger.info(
    `(Server Action) updateWithdrawal: Attempt to update withdrawal ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialWithdrawalEdit,
      any,
      IMaterialWithdrawalEdit
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
      'Withdrawal updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateWithdrawal: Error updating withdrawal ${data.id}`,
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
