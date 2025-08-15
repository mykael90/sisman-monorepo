'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { ISipacRequisicaoManutencaoWithRelations } from './requisicoes-manutencoes-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/sipac/requisicoes-manutencoes';
const API_RELATIVE_PATH = '/sipac/requisicoes-manutencoes';

const logger = new Logger(`${PAGE_PATH}/requisicoes-manutencoes-actions`);

// --- Funções de Leitura de Dados ---

interface IRequestDataSearch {
  numeroAno: string;
}

export async function getSipacRequisicoesManutencao(
  accessTokenSisman: string
): Promise<ISipacRequisicaoManutencaoWithRelations[]> {
  logger.info(
    `(Server Action) getSipacRequisicoesManutencao: Buscando lista de requisições de manutenção.`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getSipacRequisicoesManutencao: ${data.length} requisições retornadas.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getSipacRequisicoesManutencao: Erro ao buscar requisições de manutenção.`,
      error
    );
    throw error;
  }
}

export async function handleFetchRequisicaoManutencao(
  prevState: IActionResultForm<
    IRequestDataSearch,
    ISipacRequisicaoManutencaoWithRelations
  >,
  formData: FormData | string
): Promise<
  IActionResultForm<IRequestDataSearch, ISipacRequisicaoManutencaoWithRelations>
> {
  let numeroAno: string | null = null;

  //Contador para tentativas de submissão do formulário
  prevState.submissionAttempts = prevState.submissionAttempts
    ? prevState.submissionAttempts + 1
    : 1;

  if (typeof formData === 'string') {
    numeroAno = formData;
  } else if (formData instanceof FormData) {
    numeroAno = formData.get('numeroAno')?.toString() || null;
  }

  if (!numeroAno) {
    return {
      ...prevState,
      isSubmitSuccessful: false,
      message: 'Número de protocolo não fornecido.'
    };
  }

  try {
    const accessToken = await getSismanAccessToken();
    const response = await fetchApiSisman(
      `${API_RELATIVE_PATH}/fetch-one-complete`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({ numeroAno }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response) {
      return {
        ...prevState,
        isSubmitSuccessful: true,
        message: 'Dados da requisição carregados com sucesso.',
        responseData: response
      };
    } else {
      return {
        ...prevState,
        isSubmitSuccessful: false,
        message: 'Requisição não encontrada ou dados inválidos.'
      };
    }
  } catch (error: any) {
    logger.error(
      `(Server Action) handleFetchRequisicaoManutencao: Erro ao buscar requisição com protocolo ${numeroAno}.`,
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

export async function fetchOneSipacRequisicoesManutencao(
  accessTokenSisman: string,
  numeroAno: string
): Promise<ISipacRequisicaoManutencaoWithRelations> {
  logger.info(
    `(Server Action) fetchOneSipacRequisicoesManutencao: Buscando requisição de manutenção completa para ${numeroAno}.`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/fetch-one-complete`,
      accessTokenSisman,
      {
        method: 'POST',
        body: JSON.stringify({ numeroAno }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    logger.info(
      `(Server Action) fetchOneSipacRequisicoesManutencao: Requisição ${numeroAno} retornada.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) fetchOneSipacRequisicoesManutencao: Erro ao buscar requisição ${numeroAno}.`,
      error
    );
    throw error;
  }
}

// --- Ações de Formulário Exportadas (com persistência) ---

export async function fetchOneAndPersistSipacRequisicoesManutencao(
  prevState: unknown,
  data: { numeroAno: string }
): Promise<
  IActionResultForm<
    { numeroAno: string },
    ISipacRequisicaoManutencaoWithRelations
  >
> {
  logger.info(
    `(Server Action) fetchOneAndPersistSipacRequisicoesManutencao: Tentativa de buscar e persistir requisição ${data.numeroAno}.`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      { numeroAno: string },
      ISipacRequisicaoManutencaoWithRelations,
      { numeroAno: string }
    >(
      data, // validatedData (no validation schema for this simple action)
      data, // submittedData
      {
        endpoint: `${API_RELATIVE_PATH}/fetch-one-complete-and-persist`,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      `Requisição ${data.numeroAno} buscada e persistida com sucesso!`
    );
  } catch (error) {
    logger.error(
      `(Server Action) fetchOneAndPersistSipacRequisicoesManutencao: Erro inesperado para ${data.numeroAno}.`,
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

export async function fetchManyAndPersistSipacRequisicoesManutencao(
  prevState: unknown,
  data: { numeroAnoArray: string[] }
): Promise<
  IActionResultForm<
    { numeroAnoArray: string[] },
    ISipacRequisicaoManutencaoWithRelations[]
  >
> {
  logger.info(
    `(Server Action) fetchManyAndPersistSipacRequisicoesManutencao: Tentativa de buscar e persistir múltiplas requisições.`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      { numeroAnoArray: string[] },
      ISipacRequisicaoManutencaoWithRelations[],
      { numeroAnoArray: string[] }
    >(
      data, // validatedData
      data, // submittedData
      {
        endpoint: `${API_RELATIVE_PATH}/fetch-many-complete-and-persist`,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      `Múltiplas requisições (${data.numeroAnoArray.length}) buscadas e persistidas com sucesso!`
    );
  } catch (error) {
    logger.error(
      `(Server Action) fetchManyAndPersistSipacRequisicoesManutencao: Erro inesperado.`,
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

export async function getRefreshedSipacRequisicoesManutencao() {
  logger.info(
    `(Server Action) getRefreshedSipacRequisicoesManutencao: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedSipacRequisicoesManutencao: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedSipacRequisicoesManutencao: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
  }
}
