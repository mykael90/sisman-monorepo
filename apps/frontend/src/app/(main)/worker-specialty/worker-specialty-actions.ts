'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IWorkerSpecialty,
  IWorkerSpecialtyAdd,
  IWorkerSpecialtyEdit,
  IWorkerSpecialtyWithRelations
} from './worker-specialty-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/worker-specialty';
const API_RELATIVE_PATH = '/worker-specialty';

const logger = new Logger(`${PAGE_PATH}/worker-specialty-actions`);

// --- Funções de Leitura de Dados ---

export async function getWorkerSpecialties(
  accessTokenSisman: string
): Promise<IWorkerSpecialtyWithRelations[]> {
  logger.info(
    `(Server Action) getWorkerSpecialties: Buscando lista de especialidades de trabalhadores.`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getWorkerSpecialties: ${data.length} especialidades de trabalhadores retornadas.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkerSpecialties: Erro ao buscar especialidades de trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function showWorkerSpecialty(
  id: number,
  accessTokenSisman: string
): Promise<IWorkerSpecialty> {
  logger.info(
    `(Server Action) showWorkerSpecialty: Buscando especialidade de trabalhador com ID ${id}.`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      {
        // cache: 'force-cache'
      }
    );
    logger.info(
      `(Server Action) showWorkerSpecialty: Especialidade de trabalhador com ID ${id} retornada.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showWorkerSpecialty: Erro ao buscar especialidade de trabalhador com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedWorkerSpecialties() {
  logger.info(
    `(Server Action) getRefreshedWorkerSpecialties: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedWorkerSpecialties: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedWorkerSpecialties: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
  }
}

// --- Ações de Formulário Exportadas ---

export async function addWorkerSpecialty(
  prevState: unknown,
  data: IWorkerSpecialtyAdd
): Promise<IActionResultForm<IWorkerSpecialtyAdd, IWorkerSpecialty>> {
  logger.info(
    `(Server Action) addWorkerSpecialty: Tentativa de adicionar especialidade de trabalhador.`,
    data
  );

  const validatedWorkerSpecialtyData = data;
  logger.info(
    `(Server Action) addWorkerSpecialty: Dados da especialidade de trabalhador validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerSpecialtyAdd,
      IWorkerSpecialty,
      IWorkerSpecialtyAdd
    >(
      validatedWorkerSpecialtyData,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Especialidade de trabalhador cadastrada com sucesso!'
    );
  } catch (error) {
    logger.error(`(Server Action) addWorkerSpecialty: Erro inesperado.`, error);
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

export async function updateWorkerSpecialty(
  prevState: unknown,
  data: IWorkerSpecialtyEdit
): Promise<IActionResultForm<IWorkerSpecialtyEdit, IWorkerSpecialty>> {
  logger.info(
    `(Server Action) updateWorkerSpecialty: Tentativa de atualizar especialidade de trabalhador ${data.id}.`,
    data
  );

  const validatedWorkerSpecialtyData = data;
  logger.info(
    `(Server Action) updateWorkerSpecialty: Dados da especialidade de trabalhador ${validatedWorkerSpecialtyData.id} validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerSpecialtyEdit,
      IWorkerSpecialty,
      IWorkerSpecialtyEdit
    >(
      validatedWorkerSpecialtyData,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/${validatedWorkerSpecialtyData.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${validatedWorkerSpecialtyData.id}`
      },
      'Especialidade de trabalhador atualizada com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateWorkerSpecialty: Erro inesperado para a especialidade de trabalhador ${data.id}.`,
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
