'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { IServidor, IServidoresList } from './servidores-types';
import { fetchApiUFRN } from '../../../../lib/fetch/api-ufrn';
import { getUfrnAccessToken } from '../../../../lib/auth/get-access-token';

const PAGE_PATH = '/sipac/servidores'; // Usar maiúsculas para constantes globais ao módulo
const API_RELATIVE_PATH = '/site/v1/servidores'; // Para chamadas de API relacionadas a usuários

const logger = new Logger(`${PAGE_PATH}/servidores-actions`);

// --- Funções de Leitura de Dados ---

export async function getServidores(
  accessTokenUFRN: string,
  query?: string
): Promise<IServidor[]> {
  logger.info(
    `(Server Action) getServidores: Buscando lista de servidores com query "${query}".`
  );
  try {
    const url = query
      ? `${API_RELATIVE_PATH}?limit=100&${encodeURIComponent(query)}`
      : `${API_RELATIVE_PATH}?limit=100`;
    const response = await fetchApiUFRN(API_RELATIVE_PATH, accessTokenUFRN, {
      cache: 'no-store' // Cache agressivo para dados que mudam pouco
    });
    const data = await response.json();
    logger.info(
      `(Server Action) getServidores: ${data.length} servidores retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getServidores: Erro ao buscar servidores.`,
      error
    );
    throw error; // Re-lança para ser tratado pelo Next.js ou error boundary
  }
}

export async function searchServidores(query?: string): Promise<IServidor[]> {
  const accessTokenUFRN = await getUfrnAccessToken();

  logger.info(
    `(Server Action) getServidores: Buscando lista de servidores com query "${query}".`
  );
  try {
    const url = query
      ? `${API_RELATIVE_PATH}?limit=100&${query}`
      : `${API_RELATIVE_PATH}?limit=100`;
    const response = await fetchApiUFRN(url, accessTokenUFRN, {
      cache: 'no-store' // Cache agressivo para dados que mudam pouco
    });
    const data = await response.json();
    logger.info(
      `(Server Action) getServidores: ${data.length} servidores retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getServidores: Erro ao buscar servidores.`,
      error
    );
    throw error; // Re-lança para ser tratado pelo Next.js ou error boundary
  }
}
