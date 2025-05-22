'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import formDataToObject from '../../../lib/formdata-to-object';
import { IActionResultForm } from '../../../types/types-server-actions';
import { IUser, IUserAdd, IUserEdit, IUserList } from './user-types';
import {
  validateFormData,
  userFormSchemaAdd,
  userFormSchemaEdit
} from './_components/form/user-form-validation';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/users'; // Usar maiúsculas para constantes globais ao módulo
const API_RELATIVE_PATH = '/users'; // Para chamadas de API relacionadas a usuários

const logger = new Logger(`${PAGE_PATH}/user-actions`);

// --- Funções de Leitura de Dados ---

export async function getUsers(
  accessTokenSisman: string
): Promise<IUserList[]> {
  logger.info(`(Server Action) getUsers: Buscando lista de usuários.`);
  try {
    const response = await fetchApiSisman(
      API_RELATIVE_PATH,
      accessTokenSisman,
      {
        cache: 'force-cache' // Cache agressivo para dados que mudam pouco
      }
    );
    const data = await response.json();
    logger.info(
      `(Server Action) getUsers: ${data.length} usuários retornados.`
    );
    return data;
  } catch (error) {
    logger.error(`(Server Action) getUsers: Erro ao buscar usuários.`, error);
    throw error; // Re-lança para ser tratado pelo Next.js ou error boundary
  }
}

export async function showUser(
  accessTokenSisman: string,
  id: number
): Promise<IUserEdit> {
  logger.info(`(Server Action) showUser: Buscando usuário com ID ${id}.`);
  try {
    const response = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      {
        cache: 'no-store' // Garante dados sempre atualizados para um usuário específico
      }
    );
    const data = await response.json();
    logger.info(`(Server Action) showUser: Usuário com ID ${id} retornado.`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showUser: Erro ao buscar usuário com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedUsers(): Promise<void> {
  // O objetivo principal é revalidar, não necessariamente retornar dados.
  // Se fosse para retornar, o tipo seria Promise<IUserList[]> e chamaria getUsers.
  logger.info(
    `(Server Action) getRefreshedUsers: Iniciando revalidação de dados para ${PAGE_PATH}.`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedUsers: Caminho "${PAGE_PATH}" revalidado com sucesso.`
    );
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedUsers: Erro ao revalidar caminho ${PAGE_PATH}.`,
      error
    );
    // Decide-se não re-lançar aqui, pois a falha na revalidação pode não ser crítica para o client,
    // mas é importante logar. Se for crítico, re-lançar.
  }
}

// --- Ações de Formulário Exportadas ---

export async function addUser(
  prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<IUserAdd, IUser>> {
  const rawData = formDataToObject<IUserAdd>(formData);
  logger.info(
    `(Server Action) addUser: Tentativa de adicionar usuário.`,
    rawData
  );

  // 1. Validação específica para UserAdd
  const validationProcessResult = validateFormData(rawData, userFormSchemaAdd); // userFormSchema é específico para usuários

  if (!validationProcessResult.success) {
    logger.warn(
      `(Server Action) addUser: Falha na validação do formulário.`,
      validationProcessResult.errorResult.errorsFieldsServer
    );
    return validationProcessResult.errorResult; // Retorna o erro de validação formatado
  }

  // Se a validação for bem-sucedida, validationProcessResult.data contém os dados validados
  const validatedUserData = validationProcessResult.data;
  logger.info(
    `(Server Action) addUser: Dados do usuário validados com sucesso.`
  );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IUserAdd, IUser, IUserAdd>( // TValidatedData, TApiResponseData, TSubmittedData
      validatedUserData, // Dados validados para enviar à API
      rawData, // Dados brutos originais para o campo submittedData
      {
        endpoint: API_RELATIVE_PATH, // Endpoint para criar usuários
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH // Path principal para revalidar
        // detailPath não se aplica diretamente na criação, a menos que você redirecione para a página de detalhes
      },
      'Usuário cadastrado com sucesso!'
    );
  } catch (error) {
    // Erros inesperados não tratados por handleApiAction (ex: falha em getSismanAccessToken)
    logger.error(`(Server Action) addUser: Erro inesperado.`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: [
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      ],
      submittedData: rawData,
      message: 'Erro inesperado.'
    };
  }
}

export async function updateUser(
  prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<IUserEdit, IUser>> {
  // Supondo que a API retorna IUser
  const rawData = formDataToObject<IUserEdit>(formData);
  logger.info(
    `(Server Action) updateUser: Tentativa de atualizar usuário ${rawData.id}.`,
    rawData
  );

  // 1. Validação específica para UserEdit
  // Se o schema de edição for diferente, use-o aqui. Se for o mesmo:
  const validationProcessResult = validateFormData(rawData, userFormSchemaEdit);

  if (!validationProcessResult.success) {
    logger.warn(
      `(Server Action) updateUser: Falha na validação do formulário para o usuário ${rawData.id}.`,
      validationProcessResult.errorResult.errorsFieldsServer
    );
    return validationProcessResult.errorResult;
  }

  const validatedUserData = validationProcessResult.data;
  logger.info(
    `(Server Action) updateUser: Dados do usuário ${validatedUserData.id} validados com sucesso.`
  );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IUserEdit, IUser, IUserEdit>(
      validatedUserData,
      rawData,
      {
        endpoint: `${API_RELATIVE_PATH}/${validatedUserData.id}`, // Endpoint para atualizar usuário específico
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/${validatedUserData.id}` // Revalida a página de detalhes do usuário
      },
      'Usuário atualizado com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateUser: Erro inesperado para o usuário ${rawData.id}.`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: [
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      ],
      submittedData: rawData,
      message: 'Erro inesperado.'
    };
  }
}
