'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IWorker,
  IWorkerAdd,
  IWorkerEdit,
  IWorkerSpecialtyWithRelations,
  IWorkerWithdrawals,
  IWorkerWithRelations
} from './worker-types';
// import {
//   workerFormSchemaAdd,
//   workerFormSchemaEdit
// } from './_components/form/worker-form-validation'; // Comentado até que os schemas sejam fornecidos
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/worker';
const API_RELATIVE_PATH = '/worker';

const logger = new Logger(`${PAGE_PATH}/worker-actions`);

// --- Funções de Leitura de Dados ---

export async function getWorkers(
  accessTokenSisman: string
): Promise<IWorkerWithRelations[]> {
  logger.info(`(Server Action) getWorkers: Buscando lista de trabalhadores.`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getWorkers: ${data.length} trabalhadores retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkers: Erro ao buscar trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function getActivesWorkers(
  accessTokenSisman: string
): Promise<IWorkerWithRelations[]> {
  logger.info(`(Server Action) getWorkers: Buscando lista de trabalhadores.`);
  try {
    const data = await fetchApiSisman(
      API_RELATIVE_PATH,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      },
      {
        isActive: true
      }
    );
    logger.info(
      `(Server Action) getWorkers: ${data.length} trabalhadores retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkers: Erro ao buscar trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function getWorkersWithActiveContract(): Promise<
  IWorkerWithRelations[]
> {
  logger.info(`(Server Action) getWorkers: Buscando lista de trabalhadores.`);
  try {
    const accessTokenSisman = await getSismanAccessToken();

    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/active-contract`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      }
    );
    logger.info(
      `(Server Action) getWorkers with active contract: ${data.length} trabalhadores retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkers: Erro ao buscar trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function getWorkersSpecialties(
  accessTokenSisman: string
): Promise<IWorkerSpecialtyWithRelations[]> {
  logger.info(`(Server Action) getWorkers: Buscando lista de trabalhadores.`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}-specialty`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      }
    );
    logger.info(
      `(Server Action) getWorkers: ${data.length} trabalhadores retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkers: Erro ao buscar trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function showWorker(
  id: number,
  accessTokenSisman: string
): Promise<IWorker> {
  logger.info(`(Server Action) showWorker: Buscando trabalhador com ID ${id}.`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      }
    );
    logger.info(
      `(Server Action) showWorker: Trabalhador com ID ${id} retornado.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showWorker: Erro ao buscar trabalhador com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedWorkers() {
  logger.info(
    `(Server Action) getRefreshedWorkers: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedWorkers: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedWorkers: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
  }
}

// --- Ações de Formulário Exportadas ---

export async function addWorker(
  prevState: unknown,
  data: IWorkerAdd
): Promise<IActionResultForm<IWorkerAdd, IWorker>> {
  logger.info(
    `(Server Action) addWorker: Tentativa de adicionar trabalhador.`,
    data
  );
  // logger.info(JSON.stringify(data.workerContracts)); // Se os contratos forem passados corretamente como um array de objetos

  // 1. Validação específica para WorkerAdd (comentado)
  // const validationProcessResult = validateFormData(data, workerFormSchemaAdd);
  // if (!validationProcessResult.success) {
  //   logger.warn(
  //     `(Server Action) addWorker: Falha na validação do formulário.`,
  //     validationProcessResult.errorResult.errorsFieldsServer
  //   );
  //   return {
  //     ...validationProcessResult.errorResult,
  //     submittedData: data
  //   };
  // }
  // const validatedWorkerData = data; // This is IWorkerAdd
  // logger.info(
  //   `(Server Action) addWorker: Dados do trabalhador validados com sucesso.`
  // );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();

    // Se houver arquivo, convertemos para FormData para suportar multipart/form-data
    if (data.file && data.file instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (val instanceof File) {
            formData.append(key, val);
          } else {
            formData.append(key, String(val));
          }
        }
      });

      return (await handleApiAction<FormData, IWorker, IWorkerAdd>(
        formData,
        data,
        {
          endpoint: API_RELATIVE_PATH,
          method: 'POST',
          accessToken: accessToken
        },
        {
          mainPath: PAGE_PATH
        },
        'Trabalhador cadastrado com sucesso!'
      )) as any;
    }

    // Se não houver arquivo, enviamos como JSON padrão
    return (await handleApiAction<IWorkerAdd, IWorker, IWorkerAdd>(
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
      'Trabalhador cadastrado com sucesso!'
    )) as any;
  } catch (error) {
    logger.error(`(Server Action) addWorker: Erro inesperado.`, error);
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

export async function updateWorker(
  prevState: unknown,
  data: IWorkerEdit
): Promise<IActionResultForm<IWorkerEdit, IWorker>> {
  logger.info(
    `(Server Action) updateWorker: Tentativa de atualizar trabalhador ${data.id}.`,
    data
  );

  // 1. Validação específica para WorkerEdit (comentado) a validação já ocorre no frontend
  // const validationProcessResult = validateFormData(data, workerFormSchemaEdit);
  // if (!validationProcessResult.success) {
  //   logger.warn(
  //     `(Server Action) updateWorker: Falha na validação do formulário para o trabalhador ${data.id}.`,
  //     validationProcessResult.errorResult.errorsFieldsServer
  //   );
  //   return {
  //     ...validationProcessResult.errorResult,
  //     submittedData: data
  //   };
  // }
  // const validatedWorkerData = data; // This is IWorkerEdit
  // logger.info(
  //   `(Server Action) updateWorker: Dados do trabalhador ${validatedWorkerData.id} validados com sucesso.`
  // );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();

    // Se houver arquivo, convertemos para FormData para suportar multipart/form-data
    if (data.file && data.file instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (val instanceof File) {
            formData.append(key, val);
          } else {
            formData.append(key, String(val));
          }
        }
      });

      return (await handleApiAction<FormData, IWorker, IWorkerEdit>(
        formData,
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
        'Trabalhador atualizado com sucesso!'
      )) as any;
    }

    // Se não houver arquivo, enviamos como JSON padrão
    return (await handleApiAction<IWorkerEdit, IWorker, IWorkerEdit>(
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
      'Trabalhador atualizado com sucesso!'
    )) as any;
  } catch (error) {
    logger.error(
      `(Server Action) updateWorker: Erro inesperado para o trabalhador ${data.id}.`,
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

export async function listWorkersWithdrawals(params?: {
  from?: Date;
  to?: Date;
}): Promise<IWorkerWithdrawals[]> {
  const urlParams = new URLSearchParams();
  if (params?.from) {
    urlParams.append('startDate', params.from.toISOString());
  }

  if (params?.to) {
    urlParams.append('endDate', params.to.toISOString());
  }

  console.log(urlParams.toString());

  try {
    const accessTokenSisman = await getSismanAccessToken();
    logger.info(
      `(Server Action) listWorkersWithdrawals: Buscando lista de trabalhadores com retiradas.`
    );

    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/withdrawals`,
      accessTokenSisman,
      { cache: 'no-store' },
      {
        startDate: urlParams.get('startDate'),
        endDate: urlParams.get('endDate')
      }
    );
    logger.info(
      `(Server Action) listWorkersWithdrawals: ${data.length} workers returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) listWorkersWithdrawals: Error fetching`,
      error
    );
    throw error;
  }
}
