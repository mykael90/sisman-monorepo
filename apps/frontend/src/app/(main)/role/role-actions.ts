'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../types/types-server-actions';
import { IRole, IRoleAdd, IRoleEdit, IRoleList } from './role-types';
import {
  roleFormSchemaAdd,
  roleFormSchemaEdit
} from './_components/form/role-form-validation';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';
import { validateFormData } from '../../../lib/validate-form-data';

const PAGE_PATH = '/role';
const API_RELATIVE_PATH = '/role'; // Endpoint da API para UserRoletype

const logger = new Logger(`${PAGE_PATH}/role-actions`);

// --- Funções de Leitura de Dados ---

export async function getRoles(
  accessTokenSisman: string
): Promise<IRoleList[]> {
  logger.info(`(Server Action) getRoles: Buscando lista de papéis.`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // next: { tags: ['roles'] }, // Para revalidação baseada em tags
      cache: 'no-store' // Ou 'force-cache' com revalidação por path/tag
    });
    logger.info(`(Server Action) getRoles: ${data.length} papéis retornados.`);
    return data;
  } catch (error) {
    logger.error(`(Server Action) getRoles: Erro ao buscar papéis.`, error);
    throw error;
  }
}

export async function showRole(
  accessTokenSisman: string,
  id: number
): Promise<IRoleEdit> {
  // Retorna IRoleEdit para popular o formulário de edição
  logger.info(`(Server Action) showRole: Buscando papel com ID ${id}.`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      {
        // next: { tags: [`role:${id}`] },
        cache: 'no-store'
      }
    );
    logger.info(`(Server Action) showRole: Papel com ID ${id} retornado.`);
    // Adapta para IRoleEdit se necessário (ex: se a API retorna campos extras)
    return {
      id: data.id,
      role: data.role,
      description: data.description || ''
    };
  } catch (error) {
    logger.error(
      `(Server Action) showRole: Erro ao buscar papel com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedRoles(): Promise<void> {
  logger.info(
    `(Server Action) getRefreshedRoles: Iniciando revalidação para ${PAGE_PATH}.`
  );
  revalidatePath(PAGE_PATH, 'layout'); // Revalida a página de listagem e o layout (que pode buscar dados)
  // revalidateTag('roles'); // Se estiver usando tags
  logger.info(
    `(Server Action) getRefreshedRoles: Caminho "${PAGE_PATH}" revalidado.`
  );
}

// --- Ações de Formulário Exportadas ---

export async function addRole(
  prevState: unknown, // Or IActionResultForm<IRoleAdd, IRole>
  data: IRoleAdd // Directly accept the object, not FormData
): Promise<IActionResultForm<IRoleAdd, IRole>> {
  logger.info(`(Server Action) addRole: Tentativa de adicionar papel.`, data);

  // 1. Validação específica para RoleAdd
  const validationProcessResult = validateFormData(data, roleFormSchemaAdd);

  if (!validationProcessResult.success) {
    logger.warn(
      `(Server Action) addRole: Falha na validação do formulário.`,
      validationProcessResult.errorResult.errorsFieldsServer
    );
    return {
      ...validationProcessResult.errorResult,
      submittedData: data // Ensure submittedData reflects the object
    };
  }

  const validatedRoleData = validationProcessResult.data; // This is IRoleAdd
  logger.info(`(Server Action) addRole: Dados do papel validados com sucesso.`);

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IRoleAdd, IRole, IRoleAdd>(
      validatedRoleData,
      data, // Pass the original 'data' object as submittedData for handleApiAction
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Papel cadastrado com sucesso!'
    );
  } catch (error) {
    logger.error(`(Server Action) addRole: Erro inesperado.`, error);
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

export async function updateRole(
  prevState: unknown, // Or IActionResultForm<IRoleEdit, IRole>
  data: IRoleEdit // Directly accept the object, not FormData
): Promise<IActionResultForm<IRoleEdit, IRole>> {
  logger.info(
    `(Server Action) updateRole: Tentativa de atualizar papel ${data.id}.`,
    data
  );

  // 1. Validação específica para RoleEdit
  const validationProcessResult = validateFormData(data, roleFormSchemaEdit);

  if (!validationProcessResult.success) {
    logger.warn(
      `(Server Action) updateRole: Falha na validação do formulário para o papel ${data.id}.`,
      validationProcessResult.errorResult.errorsFieldsServer
    );
    return {
      ...validationProcessResult.errorResult,
      submittedData: data // Ensure submittedData reflects the object
    };
  }

  const validatedRoleData = validationProcessResult.data; // This is IRoleEdit
  logger.info(
    `(Server Action) updateRole: Dados do papel ${validatedRoleData.id} validados com sucesso.`
  );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IRoleEdit, IRole, IRoleEdit>(
      validatedRoleData,
      data, // Pass the original 'data' object as submittedData
      {
        endpoint: `${API_RELATIVE_PATH}/${validatedRoleData.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${validatedRoleData.id}`
      },
      'Papel atualizado com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateRole: Erro inesperado para o papel ${data.id}.`,
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

// --- Ações de Formulário Exportadas ---
