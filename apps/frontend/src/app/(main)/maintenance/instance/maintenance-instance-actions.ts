'use server';

import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';
import { revalidatePath } from 'next/cache';
import {
  IMaintenanceInstanceAdd,
  IMaintenanceInstanceEdit
} from './maintenance-instance-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';
import type { IActionResultForm } from '../../../../types/types-server-actions';
import type { IMaintenanceInstanceList } from './maintenance-instance-types';

const PAGE_PATH = '/maintenance/instance';
const API_PATH = '/maintenance-instance';

export async function getMaintenanceInstances(
  accessToken: string
): Promise<IMaintenanceInstanceList[]> {
  try {
    const data = await fetchApiSisman(API_PATH, accessToken);

    return data as IMaintenanceInstanceList[];
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

export async function showInstance(
  accessToken: string,
  id: number
): Promise<IMaintenanceInstanceEdit> {
  try {
    const data = await fetchApiSisman(`${API_PATH}/${id}`, accessToken);
    return data as IMaintenanceInstanceEdit;
  } catch (error) {
    console.error('Failed to fetch maintenance instance:', error);
    throw error;
  }
}

export async function addInstance(
  _prevState: unknown,
  data: IMaintenanceInstanceAdd
): Promise<IActionResultForm<IMaintenanceInstanceAdd>> {
  // No server-side validation for addInstance
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaintenanceInstanceAdd,
      any,
      IMaintenanceInstanceAdd
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
  { id, ...data }: IMaintenanceInstanceEdit
): Promise<IActionResultForm<IMaintenanceInstanceEdit>> {
  // No server-side validation for updateInstance
  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaintenanceInstanceEdit,
      any,
      IMaintenanceInstanceEdit
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
