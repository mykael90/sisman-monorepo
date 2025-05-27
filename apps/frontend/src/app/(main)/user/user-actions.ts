'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../types/types-server-actions';
import { IUser, IUserAdd, IUserEdit, IUserList } from './user-types';
import {
  validateFormData,
  userFormSchemaAdd,
  userFormSchemaEdit
} from './_components/form/user-form-validation';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/user'; // Usar maiúsculas para constantes globais ao módulo
const API_RELATIVE_PATH = '/user'; // Para chamadas de API relacionadas a usuários

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
        cache: 'force-cache' // Quando atualizar um usuário é eliminar o cache dele com revalidatePath, e a rota geral
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
  prevState: unknown, // Or IActionResultForm<IUserAdd, IUser> if you prefer stricter prev state typing
  data: IUserAdd // Changed from formData: FormData
): Promise<IActionResultForm<IUserAdd, IUser>> {
  // const rawData = formDataToObject<IUserAdd>(formData); // NO LONGER NEEDED, 'data' is the object
  logger.info(
    `(Server Action) addUser: Tentativa de adicionar usuário.`,
    data // Log the received object
  );
  logger.info(JSON.stringify(data.roles)); // If roles are passed correctly as an array of objects

  // 1. Validação específica para UserAdd
  // 'validateFormData' now receives the object directly
  const validationProcessResult = validateFormData(data, userFormSchemaAdd);

  if (!validationProcessResult.success) {
    logger.warn(
      `(Server Action) addUser: Falha na validação do formulário.`,
      validationProcessResult.errorResult.errorsFieldsServer
    );
    // Important: Make sure submittedData in errorResult uses the 'data' object
    return {
      ...validationProcessResult.errorResult,
      submittedData: data // Ensure submittedData reflects the object
    };
  }

  const validatedUserData = validationProcessResult.data; // This is IUserAdd
  logger.info(
    `(Server Action) addUser: Dados do usuário validados com sucesso.`
  );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IUserAdd, IUser, IUserAdd>(
      validatedUserData,
      data, // Pass the original 'data' object as submittedData for handleApiAction
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Usuário cadastrado com sucesso!'
    );
  } catch (error) {
    logger.error(`(Server Action) addUser: Erro inesperado.`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: [
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      ],
      submittedData: data, // Use the 'data' object
      message: 'Erro inesperado.'
    };
  }
}

export async function updateUser(
  prevState: unknown, // Or IActionResultForm<IUserEdit, IUser>
  data: IUserEdit // Changed from formData: FormData
): Promise<IActionResultForm<IUserEdit, IUser>> {
  // const rawData = formDataToObject<IUserEdit>(formData); // NO LONGER NEEDED
  logger.info(
    `(Server Action) updateUser: Tentativa de atualizar usuário ${data.id}.`,
    data // Log the received object
  );

  // 1. Validação específica para UserEdit
  const validationProcessResult = validateFormData(data, userFormSchemaEdit);

  if (!validationProcessResult.success) {
    logger.warn(
      `(Server Action) updateUser: Falha na validação do formulário para o usuário ${data.id}.`,
      validationProcessResult.errorResult.errorsFieldsServer
    );
    return {
      ...validationProcessResult.errorResult,
      submittedData: data // Ensure submittedData reflects the object
    };
  }

  const validatedUserData = validationProcessResult.data; // This is IUserEdit
  logger.info(
    `(Server Action) updateUser: Dados do usuário ${validatedUserData.id} validados com sucesso.`
  );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IUserEdit, IUser, IUserEdit>(
      validatedUserData,
      data, // Pass the original 'data' object as submittedData
      {
        endpoint: `${API_RELATIVE_PATH}/${validatedUserData.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${validatedUserData.id}`
      },
      'Usuário atualizado com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateUser: Erro inesperado para o usuário ${data.id}.`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: [
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      ],
      submittedData: data, // Use the 'data' object
      message: 'Erro inesperado.'
    };
  }
}
