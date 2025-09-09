'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptAddPayload,
  IMaterialReceiptEdit,
  IMaterialReceiptWithRelations
} from './receipt-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';
import { receiptServiceUsageMapping } from './_components/add/mapper-to-payload';
import { createPayload } from '../../../../../lib/payload-creator';

const PAGE_PATH = '/material/receipt';
const API_RELATIVE_PATH = '/material-receipt';

const logger = new Logger(`${PAGE_PATH}/receipt-actions`);

export async function getReceipts(accessTokenSisman: string) {
  logger.info(`(Server Action) getReceipts: Fetching receipts`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getReceipts: ${data.length} receipts returned`
    );
    return data;
  } catch (error) {
    logger.error(`(Server Action) getReceipts: Error fetching receipts`, error);
    throw error;
  }
}

export async function getReceiptsByWarehouse(warehouseId: number) {
  const accessTokenSisman = await getSismanAccessToken();
  logger.info(`(Server Action) getReceipts: Fetching receipts`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/warehouse/${warehouseId}`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      }
    );
    logger.info(
      `(Server Action) getReceipts: ${data.length} receipts returned`
    );
    return data;
  } catch (error) {
    logger.error(`(Server Action) getReceipts: Error fetching receipts`, error);
    throw error;
  }
}

export async function showReceipt(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showReceipt: Fetching receipt ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showReceipt: receipt ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showReceipt: Error fetching receipt ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedReceipts() {
  logger.info(
    `(Server Action) getRefreshedReceipts: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedReceipts: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedReceipts: Error revalidating path`,
      error
    );
  }
}

export async function addReceipt(
  prevState: unknown,
  data: IMaterialReceiptAddForm
): Promise<
  IActionResultForm<IMaterialReceiptAddForm, IMaterialReceiptWithRelations>
> {
  logger.info(`(Server Action) addReceipt: Attempt to add receipt`, data);

  //Precisa construir o payload, formulario complexo
  const payload = createPayload(data, receiptServiceUsageMapping);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialReceiptAddPayload,
      IMaterialReceiptWithRelations,
      IMaterialReceiptAddForm
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
      'Recebimento realizado com sucesso!'
    );
  } catch (error) {
    logger.error(`(Server Action) addReceipt: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateReceipt(
  prevState: unknown,
  data: IMaterialReceiptEdit
): Promise<IActionResultForm<IMaterialReceiptEdit, any>> {
  logger.info(
    `(Server Action) updateReceipt: Attempt to update receipt ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialReceiptEdit,
      any,
      IMaterialReceiptEdit
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
      'Receipt updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateReceipt: Error updating receipt ${data.id}`,
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
