'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IWorkerManualFrequency,
  IWorkerManualFrequencyAdd,
  IWorkerManualFrequencyEdit,
  IWorkerManualFrequencyWithRelations,
  IWorkerManualFrequencyType,
  IWorkerManualFrequencyTypeAdd,
  IWorkerManualFrequencyTypeEdit,
  IWorkerManualFrequencyTypeWithRelations
} from './worker-manual-frequency-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/worker-manual-frequency';
const API_RELATIVE_PATH = '/worker-manual-frequency';

const logger = new Logger(`${PAGE_PATH}/worker-manual-frequency-actions`);

// --- Funções de Leitura de Dados para WorkerManualFrequency ---

export async function getWorkerManualFrequencies(
  accessTokenSisman: string
): Promise<IWorkerManualFrequencyWithRelations[]> {
  logger.info(
    `(Server Action) getWorkerManualFrequencies: Buscando lista de frequências manuais de trabalhadores.`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {});
    logger.info(
      `(Server Action) getWorkerManualFrequencies: ${data.length} frequências manuais de trabalhadores retornadas.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkerManualFrequencies: Erro ao buscar frequências manuais de trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function showWorkerManualFrequency(
  id: number,
  accessTokenSisman: string
): Promise<IWorkerManualFrequency> {
  logger.info(
    `(Server Action) showWorkerManualFrequency: Buscando frequência manual de trabalhador com ID ${id}.`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      {}
    );
    logger.info(
      `(Server Action) showWorkerManualFrequency: Frequência manual de trabalhador com ID ${id} retornada.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showWorkerManualFrequency: Erro ao buscar frequência manual de trabalhador com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedWorkerManualFrequencies() {
  logger.info(
    `(Server Action) getRefreshedWorkerManualFrequencies: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedWorkerManualFrequencies: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedWorkerManualFrequencies: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
  }
}

// --- Ações de Formulário Exportadas para WorkerManualFrequency ---

export async function addWorkerManualFrequency(
  prevState: unknown,
  data: IWorkerManualFrequencyAdd
): Promise<
  IActionResultForm<IWorkerManualFrequencyAdd, IWorkerManualFrequency>
> {
  logger.info(
    `(Server Action) addWorkerManualFrequency: Tentativa de adicionar frequência manual de trabalhador.`,
    data
  );

  const validatedData = data;
  logger.info(
    `(Server Action) addWorkerManualFrequency: Dados da frequência manual de trabalhador validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerManualFrequencyAdd,
      IWorkerManualFrequency,
      IWorkerManualFrequencyAdd
    >(
      validatedData,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Frequência manual de trabalhador cadastrada com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addWorkerManualFrequency: Erro inesperado.`,
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

export async function updateWorkerManualFrequency(
  prevState: unknown,
  data: IWorkerManualFrequencyEdit
): Promise<
  IActionResultForm<IWorkerManualFrequencyEdit, IWorkerManualFrequency>
> {
  logger.info(
    `(Server Action) updateWorkerManualFrequency: Tentativa de atualizar frequência manual de trabalhador ${data.id}.`,
    data
  );

  const validatedData = data;
  logger.info(
    `(Server Action) updateWorkerManualFrequency: Dados da frequência manual de trabalhador ${validatedData.id} validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerManualFrequencyEdit,
      IWorkerManualFrequency,
      IWorkerManualFrequencyEdit
    >(
      validatedData,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/${validatedData.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${validatedData.id}`
      },
      'Frequência manual de trabalhador atualizada com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateWorkerManualFrequency: Erro inesperado para a frequência manual de trabalhador ${data.id}.`,
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

// --- Funções de Leitura de Dados para WorkerManualFrequencyType ---

const API_RELATIVE_PATH_TYPE = '/worker-manual-frequency-type';

export async function getWorkerManualFrequencyTypes(
  accessTokenSisman: string
): Promise<IWorkerManualFrequencyTypeWithRelations[]> {
  logger.info(
    `(Server Action) getWorkerManualFrequencyTypes: Buscando lista de tipos de frequência manual de trabalhadores.`
  );
  try {
    const data = await fetchApiSisman(
      API_RELATIVE_PATH_TYPE,
      accessTokenSisman,
      {}
    );
    logger.info(
      `(Server Action) getWorkerManualFrequencyTypes: ${data.length} tipos de frequência manual de trabalhadores retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkerManualFrequencyTypes: Erro ao buscar tipos de frequência manual de trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function showWorkerManualFrequencyType(
  id: number,
  accessTokenSisman: string
): Promise<IWorkerManualFrequencyType> {
  logger.info(
    `(Server Action) showWorkerManualFrequencyType: Buscando tipo de frequência manual de trabalhador com ID ${id}.`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH_TYPE}/${id}`,
      accessTokenSisman,
      {}
    );
    logger.info(
      `(Server Action) showWorkerManualFrequencyType: Tipo de frequência manual de trabalhador com ID ${id} retornado.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showWorkerManualFrequencyType: Erro ao buscar tipo de frequência manual de trabalhador com ID ${id}.`,
      error
    );
    throw error;
  }
}

// --- Ações de Formulário Exportadas para WorkerManualFrequencyType ---

export async function addWorkerManualFrequencyType(
  prevState: unknown,
  data: IWorkerManualFrequencyTypeAdd
): Promise<
  IActionResultForm<IWorkerManualFrequencyTypeAdd, IWorkerManualFrequencyType>
> {
  logger.info(
    `(Server Action) addWorkerManualFrequencyType: Tentativa de adicionar tipo de frequência manual de trabalhador.`,
    data
  );

  const validatedData = data;
  logger.info(
    `(Server Action) addWorkerManualFrequencyType: Dados do tipo de frequência manual de trabalhador validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerManualFrequencyTypeAdd,
      IWorkerManualFrequencyType,
      IWorkerManualFrequencyTypeAdd
    >(
      validatedData,
      data,
      {
        endpoint: API_RELATIVE_PATH_TYPE,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Tipo de frequência manual de trabalhador cadastrado com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addWorkerManualFrequencyType: Erro inesperado.`,
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

export async function updateWorkerManualFrequencyType(
  prevState: unknown,
  data: IWorkerManualFrequencyTypeEdit
): Promise<
  IActionResultForm<IWorkerManualFrequencyTypeEdit, IWorkerManualFrequencyType>
> {
  logger.info(
    `(Server Action) updateWorkerManualFrequencyType: Tentativa de atualizar tipo de frequência manual de trabalhador ${data.id}.`,
    data
  );

  const validatedData = data;
  logger.info(
    `(Server Action) updateWorkerManualFrequencyType: Dados do tipo de frequência manual de trabalhador ${validatedData.id} validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerManualFrequencyTypeEdit,
      IWorkerManualFrequencyType,
      IWorkerManualFrequencyTypeEdit
    >(
      validatedData,
      data,
      {
        endpoint: `${API_RELATIVE_PATH_TYPE}/${validatedData.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${validatedData.id}`
      },
      'Tipo de frequência manual de trabalhador atualizado com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateWorkerManualFrequencyType: Erro inesperado para o tipo de frequência manual de trabalhador ${data.id}.`,
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
