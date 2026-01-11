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
  IWorkerWithRelations
} from './worker-types';
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
  formData: FormData
): Promise<IActionResultForm<IWorkerAdd, IWorker>> {
  logger.info(`(Server Action) addWorker: Tentativa de adicionar trabalhador.`);

  // 2. Chamar a ação genérica da API enviando FormData diretamente
  try {
    const accessToken = await getSismanAccessToken();
    return (await handleApiAction<FormData, IWorker, IWorkerAdd>(
      formData,
      formData as any,
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
      submittedData: formData as any,
      message: 'Erro inesperado.'
    };
  }
}

export async function updateWorker(
  prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<IWorkerEdit, IWorker>> {
  const id = formData.get('id');
  logger.info(
    `(Server Action) updateWorker: Tentativa de atualizar trabalhador ${id}.`
  );

  // 2. Chamar a ação genérica da API enviando FormData diretamente
  try {
    const accessToken = await getSismanAccessToken();
    return (await handleApiAction<FormData, IWorker, IWorkerEdit>(
      formData,
      formData as any,
      {
        endpoint: `${API_RELATIVE_PATH}/${id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${id}`
      },
      'Trabalhador atualizado com sucesso!'
    )) as any;
  } catch (error) {
    logger.error(
      `(Server Action) updateWorker: Erro inesperado para o trabalhador ${id}.`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: [
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      ],
      submittedData: formData as any,
      message: 'Erro inesperado.'
    };
  }
}
