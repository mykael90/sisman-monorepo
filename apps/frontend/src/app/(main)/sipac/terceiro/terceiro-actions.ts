'use server';

import Logger from '@/lib/logger';
import { fetchApiUFRN } from '@/lib/fetch/api-ufrn';
import { getUfrnAccessToken } from '@/lib/auth/get-access-token';
import { ITerceiro } from './terceiro-types';

// --- Constantes ---

const PAGE_PATH = '/sipac/terceiro';
const API_RELATIVE_PATH = '/contrato/v1/contratados';

const logger = new Logger(`${PAGE_PATH}/terceiro-actions`);

// --- Funções de Leitura de Dados ---

export async function searchTerceiro(query?: string): Promise<ITerceiro[]> {
  const accessTokenUFRN = await getUfrnAccessToken();

  logger.info(
    `(Server Action) searchTerceiro: Buscando lista de terceiros com query "${query}".`
  );
  try {
    const url = query
      ? `${API_RELATIVE_PATH}?limit=100&${query}`
      : `${API_RELATIVE_PATH}?limit=100`;
    const response = await fetchApiUFRN(url, accessTokenUFRN, {
      cache: 'no-store'
    });
    const data = await response.json();
    logger.info(
      `(Server Action) searchTerceiro: ${data.length} terceiros retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) searchTerceiro: Erro ao buscar terceiros.`,
      error
    );
    throw error;
  }
}
