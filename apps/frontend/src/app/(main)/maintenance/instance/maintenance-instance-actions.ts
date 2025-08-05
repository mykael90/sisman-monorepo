'use server';

import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { revalidatePath } from 'next/cache';
import {
  MaintenanceInstanceAdd,
  MaintenanceInstanceEdit
} from './maintenance-instance-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';
import type { IActionResultForm } from '../../../../types/types-server-actions';
import type { MaintenanceInstanceList } from './maintenance-instance-types';

const PAGE_PATH = '/maintenance/instance';
const API_PATH = '/maintenance-instance';

export async function getMaintenanceInstances(
  accessToken: string
): Promise<MaintenanceInstanceList[]> {
  try {
    const response = await fetchApiSisman(API_PATH, accessToken);
    if (response instanceof Response) {
      return (await response.json()) as MaintenanceInstanceList[];
    }
    throw new Error('Unexpected response type from API');
  } catch (error) {
    console.error('Failed to fetch maintenance instances:', error);
    throw error;
  }
}

export async function getRefreshedInstances() {
  try {
    revalidatePath(PAGE_PATH);
    return true;
  } catch (error) {
    console.error('Failed to refresh instances:', error);
    throw error;
  }
}

export async function addInstance(
  _prevState: unknown,
  data: MaintenanceInstanceAdd
): Promise<IActionResultForm<MaintenanceInstanceAdd>> {
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      MaintenanceInstanceAdd,
      any,
      MaintenanceInstanceAdd
    >(
      data,
      data,
      {
        endpoint: API_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'Instância de manutenção criada com sucesso!'
    );
  } catch (error) {
    console.error('Failed to add maintenance instance:', error);
    throw error;
  }
}

export async function updateInstance(
  _prevState: unknown,
  { id, ...data }: MaintenanceInstanceEdit
): Promise<IActionResultForm<MaintenanceInstanceEdit>> {
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      MaintenanceInstanceEdit,
      any,
      MaintenanceInstanceEdit
    >(
      { id, ...data },
      { id, ...data },
      {
        endpoint: `${API_PATH}/${id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${id}`
      },
      'Instância de manutenção atualizada com sucesso!'
    );
  } catch (error) {
    console.error('Failed to update maintenance instance:', error);
    throw error;
  }
}
