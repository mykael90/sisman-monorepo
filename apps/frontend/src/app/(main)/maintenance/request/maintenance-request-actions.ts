'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import {
  IMaintenanceRequest,
  IMaintenanceRequestAdd,
  IMaintenanceRequestEdit,
  IMaintenanceRequestWithRelations
} from './maintenance-request-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/maintenance-request';
const API_RELATIVE_PATH = '/maintenance-request';

const logger = new Logger(`${PAGE_PATH}/maintenance-request-actions`);

export async function getMaintenanceRequests(
  accessTokenSisman: string
): Promise<IMaintenanceRequestWithRelations[]> {
  logger.info(
    `(Server Action) getMaintenanceRequests: Buscando lista de requisições de manutenção.`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getMaintenanceRequests: ${data.length} requisições retornadas.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getMaintenanceRequests: Erro ao buscar requisições.`,
      error
    );
    throw error;
  }
}

export async function showMaintenanceRequest(
  accessTokenSisman: string,
  id: number
): Promise<IMaintenanceRequestEdit> {
  logger.info(
    `(Server Action) showMaintenanceRequest: Buscando requisição com ID ${id}.`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showMaintenanceRequest: Requisição com ID ${id} retornada.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showMaintenanceRequest: Erro ao buscar requisição com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedMaintenanceRequests() {
  logger.info(
    `(Server Action) getRefreshedMaintenanceRequests: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedMaintenanceRequests: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedMaintenanceRequests: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
  }
}

export async function addMaintenanceRequest(
  prevState: unknown,
  data: IMaintenanceRequestAdd
): Promise<IActionResultForm<IMaintenanceRequestAdd, IMaintenanceRequest>> {
  logger.info(
    `(Server Action) addMaintenanceRequest: Tentativa de adicionar requisição.`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaintenanceRequestAdd,
      IMaintenanceRequest,
      IMaintenanceRequestAdd
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
      'Requisição de manutenção cadastrada com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addMaintenanceRequest: Erro inesperado.`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: [
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      ],
      submittedData: data,
      message: 'Erro inesperado.'
    };
  }
}

export async function updateMaintenanceRequest(
  prevState: unknown,
  data: IMaintenanceRequestEdit
): Promise<IActionResultForm<IMaintenanceRequestEdit, IMaintenanceRequest>> {
  logger.info(
    `(Server Action) updateMaintenanceRequest: Tentativa de atualizar requisição ${data.id}.`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaintenanceRequestEdit,
      IMaintenanceRequest,
      IMaintenanceRequestEdit
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
      'Requisição de manutenção atualizada com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateMaintenanceRequest: Erro inesperado para a requisição ${data.id}.`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: [
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      ],
      submittedData: data,
      message: 'Erro inesperado.'
    };
  }
}
