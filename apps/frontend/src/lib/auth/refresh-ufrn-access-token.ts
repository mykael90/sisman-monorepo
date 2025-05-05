// --- Função Auxiliar para Renovar Token UFRN ---

import { JWT } from 'next-auth/jwt';
import Logger from '@/lib/logger';

const logger = new Logger('refreshUfrnAccessToken');

export default async function refreshUfrnAccessToken(token: JWT): Promise<JWT> {
  logger.warn(`Token UFRN expirado, tentativa de renovação`);
  if (!token.refreshTokenUfrn) {
    logger.error('Missing refresh_token for UFRN');
    return { ...token, error: 'MissingRefreshTokenError' }; // Retorna erro específico
  }

  try {
    const response = await fetch(process.env.UFRN_TOKEN_URL as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.UFRN_CLIENT_ID as string,
        client_secret: process.env.UFRN_CLIENT_SECRET as string,
        grant_type: 'refresh_token',
        refresh_token: token.refreshTokenUfrn as string
      })
    });

    const tokensOrError = await response.json();

    if (!response.ok) {
      logger.error('Failed to refresh UFRN token', tokensOrError);
      throw tokensOrError; // Lança o erro para ser pego abaixo
    }

    const newToken = tokensOrError as {
      access_token: string;
      expires_in: number;
      refresh_token?: string; // O refresh token pode ou não ser retornado
    };

    logger.info(`Token UFRN renovado com sucesso`);
    return {
      ...token,
      accessTokenUfrn: newToken.access_token,
      refreshTokenUfrn: newToken.refresh_token ?? token.refreshTokenUfrn, // Atualiza se um novo for fornecido
      expiresAtUfrn: Math.floor(Date.now() / 1000 + newToken.expires_in),
      error: undefined // Limpa qualquer erro anterior
    };
  } catch (error) {
    logger.error('Error refreshing UFRN access_token', error);
    // Retorna o token original com um erro para indicar a falha na renovação
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}
