'use server';

import Logger from '@/lib/logger';
import { fetchApiUFRN } from '../../../../lib/fetch/api-ufrn';
import { getUfrnAccessToken } from '../../../../lib/auth/get-access-token';
import { IUsuario } from './usuario-types';

// --- Constantes ---

const PAGE_PATH = '/sipac/usuario'; // Usar maiúsculas para constantes globais ao módulo
const API_RELATIVE_PATH = '/usuario/v1/usuarios'; // Para chamadas de API relacionadas a usuários

const logger = new Logger(`${PAGE_PATH}/usuario-actions`);

// --- Funções de Leitura de Dados ---

export async function searchUsuario(query?: string): Promise<IUsuario[]> {
  const accessTokenUFRN = await getUfrnAccessToken();

  logger.info(
    `(Server Action) searchUsuario: Buscando lista de usuario com query "${query}".`
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
      `(Server Action) searchUsuario: ${data.length} usuario retornados.`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) searchUsuario: Erro ao buscar usuario.`,
      error
    );
    throw error; // Re-lança para ser tratado pelo Next.js ou error boundary
  }
}
