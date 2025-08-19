'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaterialRequestAdd,
  IMaterialRequestBalanceWithRelations,
  IMaterialRequestWithRelations,
  IRequestEdit
} from './material-request-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/request';
const API_RELATIVE_PATH = '/material-request';

const logger = new Logger(`${PAGE_PATH}/request-actions`);

export async function getRequests(accessTokenSisman: string) {
  logger.info(`(Server Action) getRequests: Fetching requests`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getRequests: ${data.length} requests returned`
    );
    return data;
  } catch (error) {
    logger.error(`(Server Action) getRequests: Error fetching requests`, error);
    throw error;
  }
}

export async function showRequest(accessTokenSisman: string, id: number) {
  logger.info(`(Server Action) showRequest: Fetching request ${id}`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(`(Server Action) showRequest: request ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showRequest: Error fetching request ${id}`,
      error
    );
    throw error;
  }
}
interface IRequestDataSearch {
  requestType: string;
  requestProtocolNumber: string;
}

export async function handleMaterialRequestSearch(
  prevState: IActionResultForm<
    IRequestDataSearch,
    IMaterialRequestWithRelations
  >,
  data: IRequestDataSearch
): Promise<
  IActionResultForm<IRequestDataSearch, IMaterialRequestWithRelations>
> {
  let protocolNumber: string | null = null;

  logger.info(`Type and value of data: ${typeof data} - ${data}`);

  try {
    const accessToken = await getSismanAccessToken();

    const response = await handleApiAction<
      IRequestDataSearch,
      IMaterialRequestWithRelations,
      IRequestDataSearch
    >(
      data,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/protocol`,
        method: 'GET',
        accessToken: accessToken,
        queryParams: { value: data.requestProtocolNumber }
      },
      {
        mainPath: PAGE_PATH
      },
      `Dados da requisição de material nº ${data.requestProtocolNumber} carregados com sucesso.`
    );

    //Vamos intervir se vier com erro 404, quero modificar a resposta
    if (!response.isSubmitSuccessful) {
      if (response.statusCode === 404) {
        return {
          ...prevState,
          ...response,
          message: `Requisição de material nº ${data.requestProtocolNumber} não encontrada. Verifique se as informações fornecidas estão corretas`
        };
      } else {
        return {
          ...prevState,
          ...response
        };
      }
    }

    //se vier sem erro só retorne
    return {
      ...prevState,
      ...response
    };
  } catch (error: any) {
    logger.error(
      `(Server Action) handleMaterialRequestSearch: Erro ao buscar requisição com protocolo ${protocolNumber}.`,
      error
    );
    if (error?.statusCode === 404) {
      return {
        ...prevState,
        isSubmitSuccessful: false,
        message: `Requisição de material nº ${data.requestProtocolNumber} não encontrada. Favor verifique as informações e tente novamente.`
      };
    } else {
      return {
        ...prevState,
        isSubmitSuccessful: false,
        message: 'Ocorreu um erro inesperado ao buscar a requisição.'
      };
    }
  }
}

export async function handleMaterialRequestBalanceSearch(
  prevState: IActionResultForm<string, IMaterialRequestBalanceWithRelations>,
  id: string
): Promise<IActionResultForm<string, IMaterialRequestBalanceWithRelations>> {
  logger.info(`Type and value of data: ${typeof id} - ${id}`);

  try {
    const accessToken = await getSismanAccessToken();

    const response = await handleApiAction<
      string,
      IMaterialRequestBalanceWithRelations,
      string
    >(
      id,
      id,
      {
        endpoint: `${API_RELATIVE_PATH}/balance/${id}`,
        method: 'GET',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      `Dados da requisição de material id ${id} carregados com sucesso.`
    );

    //Vamos intervir se vier com erro 404, quero modificar a resposta
    if (!response.isSubmitSuccessful) {
      if (response.statusCode === 404) {
        return {
          ...prevState,
          ...response,
          message: `Requisição id ${id} não encontrada. Verifique se as informações fornecidas estão corretas`
        };
      } else {
        return {
          ...prevState,
          ...response
        };
      }
    }

    //se vier sem erro só retorne
    return {
      ...prevState,
      ...response,
      message: `Dados da requisição de material id ${id} carregados com sucesso.`
    };
  } catch (error: any) {
    logger.error(
      `(Server Action) handleMaterialRequestSearch: Erro ao buscar requisição id ${id}.`,
      error
    );
    if (error?.statusCode === 404) {
      return {
        ...prevState,
        isSubmitSuccessful: false,
        message:
          'Requisição não encontrada. Favor verifique as informações e tente novamente.'
      };
    } else {
      return {
        ...prevState,
        isSubmitSuccessful: false,
        message: 'Ocorreu um erro inesperado ao buscar a requisição.'
      };
    }
  }
}

export async function getRefreshedRequests() {
  logger.info(
    `(Server Action) getRefreshedRequests: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedRequests: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedRequests: Error revalidating path`,
      error
    );
  }
}

export async function addRequest(
  prevState: unknown,
  data: IMaterialRequestAdd
): Promise<IActionResultForm<IMaterialRequestAdd, any>> {
  logger.info(`(Server Action) addRequest: Attempt to add request`, data);

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IMaterialRequestAdd, any, IMaterialRequestAdd>(
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
      'Request added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addRequest: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateRequest(
  prevState: unknown,
  data: IRequestEdit
): Promise<IActionResultForm<IRequestEdit, any>> {
  logger.info(
    `(Server Action) updateRequest: Attempt to update request ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IRequestEdit, any, IRequestEdit>(
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
      'Request updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateRequest: Error updating request ${data.id}`,
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
