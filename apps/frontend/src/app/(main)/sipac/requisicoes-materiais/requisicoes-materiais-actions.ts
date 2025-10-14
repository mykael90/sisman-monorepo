'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman, SismanApiError } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { ISipacRequisicaoMaterialWithRelations } from './requisicoes-materiais-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/sipac/requisicoes-materiais';
const API_RELATIVE_PATH = '/sipac/requisicoes-materiais';
const API_RELATIVE_PATH_WITH_MANUTENCAO =
  '/sipac/requisicoes-manutencoes/material-fetch-one-complete-and-persist';

const logger = new Logger(`${PAGE_PATH}/requisicoes-materiais-actions`);

// --- Funções de Leitura de Dados ---

interface IRequestDataSearch {
  numeroAno: string;
}

export async function getSipacRequisicoesMaterial(
  accessTokenSisman: string
): Promise<ISipacRequisicaoMaterialWithRelations[]> {
  logger.info(
    `(Server Action) getSipacRequisicoesMaterial: Buscando lista de requisições de material.`
  );
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getSipacRequisicoesMaterial: ${data.length} requisições retornadas.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getSipacRequisicoesMaterial: Erro ao buscar requisições de material.`,
      error
    );
    throw error;
  }
}

export async function handleFetchRequisicaoMaterial(
  prevState: IActionResultForm<
    IRequestDataSearch,
    ISipacRequisicaoMaterialWithRelations
  >,
  data: IRequestDataSearch
): Promise<
  IActionResultForm<IRequestDataSearch, ISipacRequisicaoMaterialWithRelations>
> {
  logger.info(`Type and value of data: ${typeof data} - ${data}`);

  try {
    const accessToken = await getSismanAccessToken();
    const response = await handleApiAction<
      IRequestDataSearch,
      ISipacRequisicaoMaterialWithRelations,
      IRequestDataSearch
    >(
      data, // validatedData (no validation schema for this simple action)
      data, // submittedData
      {
        endpoint: `${API_RELATIVE_PATH}/fetch-one-complete`,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      `Requisição ${data.numeroAno} buscada com sucesso!`
    );

    //Vamos intervir se vier com erro 404, quero modificar a resposta
    if (!response.isSubmitSuccessful) {
      if (response.statusCode === 404) {
        return {
          ...prevState,
          ...response,
          message: `Requisição nº ${data.numeroAno} não encontrada. Verifique se as informações fornecidas estão corretas`
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
      message: `Dados da requisição nº ${data.numeroAno} carregados com sucesso.`
    };
  } catch (error) {
    logger.error(
      `(Server Action) handleFetchRequisicaoMaterial: Erro ao buscar requisição com protocolo ${data.numeroAno}.`,
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

export async function showSipacRequisicaoMaterial(
  accessTokenSisman: string,
  id: number
): Promise<ISipacRequisicaoMaterialWithRelations> {
  logger.info(
    `(Server Action) showSipacRequisicaoMaterial: Buscando requisição
    com ID ${id}.`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
      // { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showSipacRequisicaoMaterial: Requisição com ID ${id}
      retornada.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showSipacRequisicaoMaterial: Erro ao buscar requisição com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function showSipacRequisicaoMaterialComRequisicaoManutencaoVinculada(
  numeroAno: string
): Promise<ISipacRequisicaoMaterialWithRelations> {
  logger.info(
    `(Server Action) showSipacRequisicaoMaterial: Buscando requisição
    com codigo ${numeroAno}.`
  );
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(
      API_RELATIVE_PATH_WITH_MANUTENCAO,
      accessTokenSisman,
      {
        method: 'POST',
        body: JSON.stringify({ numeroAno })
      }
    );
    logger.info(
      `(Server Action) showSipacRequisicaoMaterial: Requisição com ID ${id}
      retornada.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showSipacRequisicaoMaterial: Erro ao buscar requisição com ID ${id}.`,
      error
    );
    throw error;
  }
}

// essa função
export async function handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada(
  numeroAno: string
): Promise<ISipacRequisicaoMaterialWithRelations | null> {
  try {
    const accessTokenSisman = await getSismanAccessToken();

    logger.info(
      `(Server Action) handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada: Buscando requisição com protocolo ${numeroAno}.`
    );

    const data = await fetchApiSisman(
      API_RELATIVE_PATH_WITH_MANUTENCAO,
      accessTokenSisman,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ numeroAno })
        // cache: 'force-cache'
      }
    );

    return data;
  } catch (error: any) {
    logger.error(
      `(Server Action) handleFetchRequisicaoMaterial: Erro ao buscar requisição com protocolo ${numeroAno}.`,
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
// export async function handleFetchRequisicaoMaterialComRequisicaoManutencaoVinculadaOld(
//   prevState: IActionResultForm<
//     IRequestDataSearch,
//     ISipacRequisicaoMaterialWithRelations
//   >,
//   data: IRequestDataSearch
// ): Promise<
//   IActionResultForm<IRequestDataSearch, ISipacRequisicaoMaterialWithRelations>
// > {
//   logger.info(`Type and value of data: ${typeof data} - ${data}`);

//   try {
//     const accessToken = await getSismanAccessToken();
//     const response = await handleApiAction<
//       IRequestDataSearch,
//       ISipacRequisicaoMaterialWithRelations,
//       IRequestDataSearch
//     >(
//       data, // validatedData (no validation schema for this simple action)
//       data, // submittedData
//       {
//         endpoint: `${API_RELATIVE_PATH_WITH_MANUTENCAO}`,
//         method: 'POST',
//         accessToken: accessToken
//       },
//       {
//         mainPath: PAGE_PATH
//       },
//       `Requisição de material ${data.numeroAno} buscada com sucesso!`
//     );

//     //Vamos intervir se vier com erro 404, quero modificar a resposta
//     if (!response.isSubmitSuccessful) {
//       if (response.statusCode === 404) {
//         return {
//           ...prevState,
//           ...response,
//           message: `Requisição de material nº ${data.numeroAno} não encontrada. Verifique se as informações fornecidas estão corretas`
//         };
//       } else {
//         return {
//           ...prevState,
//           ...response
//         };
//       }
//     }

//     //se vier sem erro só retorne
//     return {
//       ...prevState,
//       ...response,
//       message: `Dados da requisição nº ${data.numeroAno} carregados com sucesso.`
//     };
//   } catch (error) {
//     logger.error(
//       `(Server Action) handleFetchRequisicaoMaterial: Erro ao buscar requisição com protocolo ${data.numeroAno}.`,
//       error
//     );

//     return {
//       isSubmitSuccessful: false,
//       errorsServer: [
//         'Ocorreu um erro inesperado ao processar sua solicitação.'
//       ],
//       submittedData: data,
//       message: 'Erro inesperado.'
//     };
//   }
// }

// --- Ações de Formulário Exportadas (com persistência) ---

export async function fetchOneAndPersistSipacRequisicoesMaterial(
  prevState: IActionResultForm<
    IRequestDataSearch,
    ISipacRequisicaoMaterialWithRelations
  >,
  data: IRequestDataSearch
): Promise<
  IActionResultForm<IRequestDataSearch, ISipacRequisicaoMaterialWithRelations>
> {
  logger.info(
    `(Server Action) fetchOneAndPersistSipacRequisicoesMaterial: Tentativa de buscar e persistir requisição ${data.numeroAno}.`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    const response = await handleApiAction<
      IRequestDataSearch,
      ISipacRequisicaoMaterialWithRelations,
      IRequestDataSearch
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

    //Vamos intervir se vier com erro 404, quero modificar a resposta
    if (!response.isSubmitSuccessful) {
      if (response.statusCode === 404) {
        return {
          ...prevState,
          ...response,
          message: `Requisição nº ${data.numeroAno} não encontrada. Verifique se as informações fornecidas estão corretas`
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
      message: `Dados da requisição nº ${data.numeroAno} carregados e persistidos com sucesso.`
    };
  } catch (error) {
    logger.error(
      `(Server Action) fetchOneAndPersistSipacRequisicoesMaterial: Erro inesperado para ${data.numeroAno}.`,
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

export async function fetchManyAndPersistSipacRequisicoesMaterial(
  prevState: unknown,
  data: { numeroAnoArray: string[] }
): Promise<
  IActionResultForm<
    { numeroAnoArray: string[] },
    ISipacRequisicaoMaterialWithRelations[]
  >
> {
  logger.info(
    `(Server Action) fetchManyAndPersistSipacRequisicoesMaterial: Tentativa de buscar e persistir múltiplas requisições.`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      { numeroAnoArray: string[] },
      ISipacRequisicaoMaterialWithRelations[],
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
      `(Server Action) fetchManyAndPersistSipacRequisicoesMaterial: Erro inesperado.`,
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

export async function getRefreshedSipacRequisicoesMaterial() {
  logger.info(
    `(Server Action) getRefreshedSipacRequisicoesMaterial: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedSipacRequisicoesMaterial: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedSipacRequisicoesMaterial: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
  }
}

export async function persistSipacRequisicoesMaterial(
  _prevState: unknown,
  data: any
): Promise<IActionResultForm<any, ISipacRequisicaoMaterialWithRelations>> {
  logger.info(
    `(Server Action) PersistSipacRequisicoesMaterial: Tentativa de persistir requisição. ${data.numeroRequisicao}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      any,
      ISipacRequisicaoMaterialWithRelations,
      any
    >(
      data, // validatedData (no validation schema for this simple action)
      data, // submittedData
      {
        endpoint: `${API_RELATIVE_PATH}/persist-create-one`,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      `Requisição ${data.numeroRequisicao} persistida com sucesso!`
    );
  } catch (error) {
    logger.error(
      `(Server Action) fetchOneAndPersistSipacRequisicoesMaterial: Erro inesperado para ${data.numeroRequisicao}.`,
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
