'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { fetchApiSisman, TQueryParams } from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaterialGlobalCatalogAdd,
  IMaterialGlobalCatalogEdit,
  IMaterialGlobalCatalogWithRelations
} from './material-global-catalog-types';
import { handleApiAction } from '@/lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/material/global-catalog';
const API_RELATIVE_PATH = '/materials';

const logger = new Logger(`${PAGE_PATH}/material-global-catalog-actions`);

export async function getMaterialGlobalCatalogs(
  accessTokenSisman: string,
  queryParams?: TQueryParams
): Promise<IMaterialGlobalCatalogWithRelations[]> {
  logger.info(
    `(Server Action) getMaterialGlobalCatalogs: Fetching material-global-catalogs`
  );
  try {
    const data = await fetchApiSisman(
      API_RELATIVE_PATH,
      accessTokenSisman,
      {
        cache: 'no-cache'
      },
      queryParams
    );
    logger.info(
      `(Server Action) getMaterialGlobalCatalogs: ${data.length} material-global-catalogs returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getMaterialGlobalCatalogs: Error fetching material-global-catalogs`,
      error
    );
    throw error;
  }
}

export async function showMaterialGlobalCatalog(
  accessTokenSisman: string,
  id: string
) {
  logger.info(
    `(Server Action) showMaterialGlobalCatalog: Fetching material-global-catalog ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showMaterialGlobalCatalog: material-global-catalog ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showMaterialGlobalCatalog: Error fetching material-global-catalog ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedMaterialGlobalCatalogs() {
  logger.info(
    `(Server Action) getRefreshedMaterialGlobalCatalogs: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedMaterialGlobalCatalogs: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedMaterialGlobalCatalogs: Error revalidating path`,
      error
    );
  }
}

export async function addMaterialGlobalCatalog(
  prevState: unknown,
  data: IMaterialGlobalCatalogAdd
): Promise<IActionResultForm<IMaterialGlobalCatalogAdd, any>> {
  logger.info(
    `(Server Action) addMaterialGlobalCatalog: Attempt to add material-global-catalog`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialGlobalCatalogAdd,
      any,
      IMaterialGlobalCatalogAdd
    >(
      data,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'MaterialGlobalCatalog added successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) addMaterialGlobalCatalog: Unexpected error`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateMaterialGlobalCatalog(
  prevState: unknown,
  data: IMaterialGlobalCatalogEdit
): Promise<IActionResultForm<IMaterialGlobalCatalogEdit, any>> {
  logger.info(
    `(Server Action) updateMaterialGlobalCatalog: Attempt to update material-global-catalog ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<
      IMaterialGlobalCatalogEdit,
      any,
      IMaterialGlobalCatalogEdit
    >(
      data,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/${data.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${data.id}`
      },
      'MaterialGlobalCatalog updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateMaterialGlobalCatalog: Error updating material-global-catalog ${data.id}`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}
