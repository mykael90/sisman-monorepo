'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../lib/fetch/api-sisman';
import formDataToObject from '../../../lib/formdata-to-object';
import { IActionResultForm } from '../../../types/types-server-actions';
import { IRole, IRoleAdd, IRoleEdit, IRoleList } from './role-types';
import {
  validateRoleFormData,
  roleFormSchemaAdd,
  roleFormSchemaEdit
} from './_components/form/role-form-validation';
import { handleApiAction } from '../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/role';
const API_RELATIVE_PATH = '/role'; // Endpoint da API para UserRoletype

const logger = new Logger(`${PAGE_PATH}/role-actions`);

// --- Funções de Leitura de Dados ---

export async function getRoles(
  accessTokenSisman: string
): Promise<IRoleList[]> {
  logger.info(`(Server Action) getRoles: Buscando lista de papéis.`);
  try {
    const response = await fetchApiSisman(
      API_RELATIVE_PATH,
      accessTokenSisman,
      {
        // next: { tags: ['roles'] }, // Para revalidação baseada em tags
        cache: 'no-store' // Ou 'force-cache' com revalidação por path/tag
      }
    );
    const data = await response.json();
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
    const response = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      {
        // next: { tags: [`role:${id}`] },
        cache: 'no-store'
      }
    );
    const data = (await response.json()) as IRole;
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
  prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<IRoleAdd, IRole>> {
  const rawData = formDataToObject<IRoleAdd>(formData);
  logger.info(
    `(Server Action) addRole: Tentativa de adicionar papel.`,
    rawData
  );

  const validationResult = validateRoleFormData(rawData, roleFormSchemaAdd);
  if (!validationResult.success) {
    logger.warn(
      `(Server Action) addRole: Falha na validação.`,
      validationResult.errorResult.errorsFieldsServer
    );
    return validationResult.errorResult;
  }

  const validatedData = validationResult.data;
  logger.info(`(Server Action) addRole: Dados validados.`);

  const accessToken = await getSismanAccessToken();
  return handleApiAction<IRoleAdd, IRole, IRoleAdd>(
    validatedData,
    rawData,
    {
      endpoint: API_RELATIVE_PATH,
      method: 'POST',
      accessToken: accessToken
    },
    { mainPath: PAGE_PATH },
    'Papel cadastrado com sucesso!'
  );
}

export async function updateRole(
  prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<IRoleEdit, IRole>> {
  const rawData = formDataToObject<IRoleEdit>(formData);
  logger.info(
    `(Server Action) updateRole: Tentativa de atualizar papel ${rawData.id}.`,
    rawData
  );

  const validationResult = validateRoleFormData(rawData, roleFormSchemaEdit);
  if (!validationResult.success) {
    logger.warn(
      `(Server Action) updateRole: Falha na validação para ${rawData.id}.`,
      validationResult.errorResult.errorsFieldsServer
    );
    return validationResult.errorResult;
  }

  const validatedData = validationResult.data;
  logger.info(
    `(Server Action) updateRole: Dados validados para ${validatedData.id}.`
  );

  const accessToken = await getSismanAccessToken();
  return handleApiAction<IRoleEdit, IRole, IRoleEdit>(
    validatedData,
    rawData,
    {
      endpoint: `${API_RELATIVE_PATH}/${validatedData.id}`,
      method: 'PUT',
      accessToken: accessToken
    },
    {
      mainPath: PAGE_PATH,
      detailPath: `${PAGE_PATH}/edit/${validatedData.id}`
    }, // Revalida lista e página de edição
    'Papel atualizado com sucesso!'
  );
}

// TODO: Implementar deleteRole se necessário
