'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman, SismanApiError } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaintenanceRequest,
  IMaintenanceRequestAdd,
  IMaintenanceRequestBalanceWithRelations,
  IMaintenanceRequestEdit,
  IMaintenanceRequestWithRelations,
  IPaginatedMaintenanceRequestDeficit
} from './maintenance-request-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

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

interface IRequestDataSearch {
  requestType: string;
  requestProtocolNumber: string;
}

export async function handleMaintenanceRequestSearch(
  prevState: IActionResultForm<
    IRequestDataSearch,
    IMaintenanceRequestWithRelations
  >,
  data: IRequestDataSearch
): Promise<
  IActionResultForm<IRequestDataSearch, IMaintenanceRequestWithRelations>
> {
  let protocolNumber: string | null = null;

  logger.info(`Type and value of data: ${typeof data} - ${data}`);

  try {
    const accessToken = await getSismanAccessToken();

    const response = await handleApiAction<
      IRequestDataSearch,
      IMaintenanceRequestWithRelations,
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
      `Dados da requisição de manutenção nº ${data.requestProtocolNumber} carregados com sucesso.`
    );

    //Vamos intervir se vier com erro 404, quero modificar a resposta

    // const response = await fetchApiSisman(
    //   `${API_RELATIVE_PATH}/protocol?value=${protocolNumber}`,
    //   accessToken,
    //   { cache: 'force-cache' }
    // );

    //Vamos intervir se vier com erro 404, quero modificar a resposta
    if (!response.isSubmitSuccessful) {
      if (response.statusCode === 404) {
        return {
          ...prevState,
          ...response,
          message: `Requisição de manutenção nº ${data.requestProtocolNumber} não encontrada. Verifique se as informações fornecidas estão corretas`
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
      `(Server Action) handleMaintenanceRequestSearch: Erro ao buscar requisição com protocolo ${protocolNumber}.`,
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

export async function showMaintenanceRequest(
  accessTokenSisman: string,
  id: number
): Promise<IMaintenanceRequestWithRelations> {
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

export async function showMaintenanceRequestByProtocol(
  protocolNumber: string
): Promise<IMaintenanceRequestWithRelations | null> {
  logger.info(
    `(Server Action) showMaintenanceRequest: Buscando requisição com ID ${protocolNumber}.`
  );
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/protocol`,
      accessTokenSisman,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Garante que a requisição não seja cacheada
      },
      { value: protocolNumber }
    );
    logger.info(
      `(Server Action) showMaintenanceRequest: Requisição com ID ${protocolNumber} retornada.`
    );
    return data;
  } catch (error: any) {
    logger.error(
      `(Server Action) showMaintenanceRequest: Erro ao buscar requisição com ID ${protocolNumber}.`,
      error
    );

    if (error instanceof SismanApiError) {
      if (error.statusCode === 404) {
        return null;
      } else {
        throw error;
      }
    }
    throw error;
  }
}
export async function showMaintenanceRequestBalanceByProtocol(
  protocolNumber: string
): Promise<IMaintenanceRequestBalanceWithRelations | null> {
  logger.info(
    `(Server Action) showMaintenanceRequest: Buscando requisição com ID ${protocolNumber}.`
  );
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/balance/protocol`,
      accessTokenSisman,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
        // cache: 'force-cache'
      },
      { value: protocolNumber }
    );
    logger.info(
      `(Server Action) showMaintenanceRequest: Requisição com ID ${protocolNumber} retornada.`
    );
    return data;
  } catch (error: any) {
    logger.error(
      `(Server Action) showMaintenanceRequest: Erro ao buscar requisição com ID ${protocolNumber}.`,
      error
    );

    if (error instanceof SismanApiError) {
      if (error.statusCode === 404) {
        return null;
      } else {
        throw error;
      }
    }
    throw error;
  }
}

export async function listMaintenanceRequestDeficitPaginated({
  pageIndex,
  pageSize
}: {
  pageIndex: number;
  pageSize: number;
}): Promise<IPaginatedMaintenanceRequestDeficit | null> {
  logger.info(
    `(Server Action) listMaintenanceRequestDeficitPaginated: listando requisições de manutenção e status deficit.`
  );
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/deficit-status-paginated`,
      accessTokenSisman,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
        // cache: 'force-cache'
      },
      { pageIndex, pageSize }
    );
    return data;
  } catch (error: any) {
    logger.error(error);
    throw error;
  }
}

export async function listMaintenanceRequestDeficitByMaintenanceInstance(
  maintenanceInstanceId: number,
  params?: { from?: Date; to?: Date }
) {
  const accessTokenSisman = await getSismanAccessToken();
  logger.info(
    `(Server Action) getMaitenanceRequestsDeficit: Fetching maintenanceRequests`
  );

  const urlParams = new URLSearchParams();
  if (params?.from) {
    urlParams.append('startDate', params.from.toISOString());
  }

  if (params?.to) {
    urlParams.append('endDate', params.to.toISOString());
  }

  console.log(urlParams.toString());

  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/deficit-status/maintenance-instance/${maintenanceInstanceId}`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      },
      {
        startDate: urlParams.get('startDate'),
        endDate: urlParams.get('endDate')
      }
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getMaitenanceRequestsDeficit: Error fetching maintenanceRequests`,
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
