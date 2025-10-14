'use server';

import Logger from '../../../../lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import {
  ISipacUnidade,
  ISipacUnidadeAdd,
  ISipacUnidadeEdit,
  ISipacUnidadeWithRelations
} from './unidade-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/sipac/unidade';
const API_RELATIVE_PATH = '/sipac/unidades';

const logger = new Logger(`${PAGE_PATH}/unidade-actions`);

export async function getSipacUnidades(
  accessTokenSisman: string
): Promise<ISipacUnidadeWithRelations[]> {
  logger.info(`(Server Action) getSipacUnidades: Fetching SipacUnidades`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getSipacUnidades: ${data.length} SipacUnidades returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getSipacUnidades: Error fetching SipacUnidades`,
      error
    );
    throw error;
  }
}

export async function showSipacUnidade(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showSipacUnidade: Fetching SipacUnidade ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showSipacUnidade: SipacUnidade ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showSipacUnidade: Error fetching SipacUnidade ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedSipacUnidades() {
  logger.info(
    `(Server Action) getRefreshedSipacUnidades: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedSipacUnidades: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedSipacUnidades: Error revalidating path`,
      error
    );
    throw error;
  }
}

export async function addSipacUnidade(
  _prevState: unknown,
  data: ISipacUnidadeAdd
): Promise<IActionResultForm<ISipacUnidadeAdd, any>> {
  logger.info(
    `(Server Action) addSipacUnidade: Attempt to add SipacUnidade`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISipacUnidadeAdd, any, ISipacUnidadeAdd>(
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
      'SipacUnidade added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addSipacUnidade: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateSipacUnidade(
  _prevState: unknown,
  data: ISipacUnidadeEdit
): Promise<IActionResultForm<ISipacUnidadeEdit, any>> {
  logger.info(
    `(Server Action) updateSipacUnidade: Attempt to update SipacUnidade ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ISipacUnidadeEdit, any, ISipacUnidadeEdit>(
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
      'SipacUnidade updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateSipacUnidade: Error updating SipacUnidade ${data.id}`,
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
