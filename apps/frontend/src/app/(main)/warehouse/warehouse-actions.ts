'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '../../../types/types-server-actions';
import {
  IWarehouse,
  IWarehouseAdd,
  IWarehouseEdit,
  IWarehouse
} from './warehouse-types';
import {
  warehouseFormSchemaAdd,
  warehouseFormSchemaEdit
} from './_components/form/warehouse-form-validation';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';
import { validateFormData } from '@/lib/validate-form-data';

const PAGE_PATH = '/warehouse';
const API_RELATIVE_PATH = '/warehouse'; // Endpoint da API para Warehouse

const logger = new Logger(`${PAGE_PATH}/warehouse-actions`);

// --- Funções de Leitura de Dados ---

export async function getWarehouses(
  accessTokenSisman: string
): Promise<IWarehouse[]> {
  logger.info(`(Server Action) getWarehouses: Buscando lista de depósitos.`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      // next: { tags: ['warehouses'] }, // Para revalidação baseada em tags
      cache: 'no-store' // Ou 'force-cache' com revalidação por path/tag
    });
    logger.info(
      `(Server Action) getWarehouses: ${data.length} depósitos retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getWarehouses: Erro ao buscar depósitos.`,
      error
    );
    throw error;
  }
}

export async function showWarehouse(
  accessTokenSisman: string,
  id: number
): Promise<IWarehouseEdit> {
  // Retorna IWarehouseEdit para popular o formulário de edição
  logger.info(`(Server Action) showWarehouse: Buscando depósito com ID ${id}.`);
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      {
        // next: { tags: [`warehouse:${id}`] },
        cache: 'no-store'
      }
    );
    logger.info(
      `(Server Action) showWarehouse: Depósito com ID ${id} retornado.`
    );
    // Adapta para IWarehouseEdit se necessário (ex: se a API retorna campos extras)
    return {
      id: data.id,
      name: data.name,
      code: data.code || '',
      location: data.location || '',
      isActive: data.isActive,
      maintenanceInstanceId: data.maintenanceInstanceId
    };
  } catch (error) {
    logger.error(
      `(Server Action) showWarehouse: Erro ao buscar depósito com ID ${id}.`,
      error
    );
    throw error;
  }
}

export async function getRefreshedWarehouses(): Promise<void> {
  logger.info(
    `(Server Action) getRefreshedWarehouses: Iniciando revalidação para ${PAGE_PATH}.`
  );
  revalidatePath(PAGE_PATH, 'layout'); // Revalida a página de listagem e o layout (que pode buscar dados)
  // revalidateTag('warehouses'); // Se estiver usando tags
  logger.info(
    `(Server Action) getRefreshedWarehouses: Caminho "${PAGE_PATH}" revalidado.`
  );
}

// --- Ações de Formulário Exportadas ---

export async function addWarehouse(
  prevState: unknown, // Or IActionResultForm<IWarehouseAdd, IWarehouse>
  data: IWarehouseAdd // Directly accept the object, not FormData
): Promise<IActionResultForm<IWarehouseAdd, IWarehouse>> {
  logger.info(
    `(Server Action) addWarehouse: Tentativa de adicionar depósito.`,
    data
  );

  // 1. Validação específica para WarehouseAdd
  // const validationProcessResult = validateFormData(
  //   data,
  //   warehouseFormSchemaAdd
  // );

  // if (!validationProcessResult.success) {
  //   logger.warn(
  //     `(Server Action) addWarehouse: Falha na validação do formulário.`,
  //     validationProcessResult.errorResult.errorsFieldsServer
  //   );
  //   return {
  //     ...validationProcessResult.errorResult,
  //     submittedData: data // Ensure submittedData reflects the object
  //   };
  // }

  const validatedWarehouseData = data; // This is IWarehouseAdd
  logger.info(
    `(Server Action) addWarehouse: Dados do depósito validados com sucesso.`
  );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IWarehouseAdd, IWarehouse, IWarehouseAdd>(
      validatedWarehouseData,
      data, // Pass the original 'data' object as submittedData for handleApiAction
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Depósito cadastrado com sucesso!'
    );
  } catch (error) {
    logger.error(`(Server Action) addWarehouse: Erro inesperado.`, error);
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

export async function updateWarehouse(
  prevState: unknown, // Or IActionResultForm<IWarehouseEdit, IWarehouse>
  data: IWarehouseEdit // Directly accept the object, not FormData
): Promise<IActionResultForm<IWarehouseEdit, IWarehouse>> {
  logger.info(
    `(Server Action) updateWarehouse: Tentativa de atualizar depósito ${data.id}.`,
    data
  );

  // 1. Validação específica para WarehouseEdit
  // const validationProcessResult = validateFormData(
  //   data,
  //   warehouseFormSchemaEdit
  // );

  // if (!validationProcessResult.success) {
  //   logger.warn(
  //     `(Server Action) updateWarehouse: Falha na validação do formulário para o depósito ${data.id}.`,
  //     validationProcessResult.errorResult.errorsFieldsServer
  //   );
  //   return {
  //     ...validationProcessResult.errorResult,
  //     submittedData: data // Ensure submittedData reflects the object
  //   };
  // }

  const validatedWarehouseData = data; // This is IWarehouseEdit
  logger.info(
    `(Server Action) updateWarehouse: Dados do depósito ${validatedWarehouseData.id} validados com sucesso.`
  );

  // 2. Chamar a ação genérica da API
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<IWarehouseEdit, IWarehouse, IWarehouseEdit>(
      validatedWarehouseData,
      data, // Pass the original 'data' object as submittedData
      {
        endpoint: `${API_RELATIVE_PATH}/${validatedWarehouseData.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${validatedWarehouseData.id}`
      },
      'Depósito atualizado com sucesso!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateWarehouse: Erro inesperado para o depósito ${data.id}.`,
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
