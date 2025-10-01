'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IWorkerContract,
  IWorkerContractAdd,
  IWorkerContractEdit,
  IWorkerContractWithRelations
} from './worker-contract-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/worker-contract';
const API_RELATIVE_PATH = '/worker-contract';

const logger = new Logger(`${PAGE_PATH}/worker-contract-actions`);

// --- Funções de Leitura de Dados ---

export async function getWorkerContracts(
  accessTokenSisman: string
): Promise<IWorkerContractWithRelations[]> {
  logger.info(
    `(Server Action) getWorkerContracts: Buscando lista de contratos de trabalhadores.`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getWorkerContracts: ${data.length} contratos de trabalhadores retornadas.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWorkerContracts: Erro ao buscar contratos de trabalhadores.`,
      error
    );
    throw error;
  }
}

export async function showWorkerContract(
  id: number,
  accessTokenSisman: string
): Promise<IWorkerContract> {
  logger.info(
    `(Server Action) showWorkerContract: Buscando contrato de trabalhador com ID ${id}.`
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
      `(Server Action) showWorkerContract: Contrato de trabalhador com ID ${id} retornada.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showWorkerContract: Erro ao buscar contrato de trabalhador com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedWorkerContracts() {
  logger.info(
    `(Server Action) getRefreshedWorkerContracts: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedWorkerContracts: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedWorkerContracts: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
  }
}

// --- Ações de Formulário Exportadas ---

export async function addWorkerContract(
  prevState: unknown,
  data: IWorkerContractAdd
): Promise<IActionResultForm<IWorkerContractAdd, IWorkerContract>> {
  logger.info(
    `(Server Action) addWorkerContract: Tentativa de adicionar contrato de trabalhador.`,
    data
  );

  const validatedWorkerContractData = data;
  logger.info(
    `(Server Action) addWorkerContract: Dados da contrato de trabalhador validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerContractAdd,
      IWorkerContract,
      IWorkerContractAdd
    >(
      validatedWorkerContractData,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Contrato de trabalhador cadastrada com sucesso!'
    );
  } catch (error) {
    logger.error(`(Server Action) addWorkerContract: Erro inesperado.`, error);
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

export async function updateWorkerContract(
  prevState: unknown,
  data: IWorkerContractEdit
): Promise<IActionResultForm<IWorkerContractEdit, IWorkerContract>> {
  logger.info(
    `(Server Action) updateWorkerContract: Tentativa de atualizar contrato de trabalhador ${data.id}.`,
    data
  );

  const validatedWorkerContractData = data;
  logger.info(
    `(Server Action) updateWorkerContract: Dados da contrato de trabalhador ${validatedWorkerContractData.id} validados com sucesso.`
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IWorkerContractEdit,
      IWorkerContract,
      IWorkerContractEdit
    >(
      validatedWorkerContractData,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/${validatedWorkerContractData.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${validatedWorkerContractData.id}`
      },
      'Contrato de trabalhador atualizada com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateWorkerContract: Erro inesperado para a contrato de trabalhador ${data.id}.`,
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
