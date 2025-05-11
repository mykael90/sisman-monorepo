// --- Função Auxiliar para Renovar Token Sisman ---

import { JWT } from 'next-auth/jwt';
import Logger from '@/lib/logger';
import {
  AuthorizationRequestUserData,
  createAuthorizationRequestToken,
  fetchAuthorizationApiToken
} from './authorization-sisman';

const logger = new Logger('refreshSismanAccessToken');

export default async function refreshSismanAccessToken(
  token: JWT
): Promise<JWT> {
  // Assume que o token Sisman pode expirar ou precisar ser renovado
  // A lógica exata de quando renovar pode precisar ser ajustada na chamada desta função
  logger.warn(`Tentativa de renovação do token Sisman`);

  const userDataForToken: AuthorizationRequestUserData = {
    email: token.email as string,
    login: token.login as string, // Inclui o login (username)
    name: token.name as string, // Inclui o name
    image: token.image as string
  };

  //utilizar a mesma lógica para criar o token original e o de refresh. No SISMAN a autenticação sempre é enviando um token mesmo
  const refreshTokenSisman =
    await createAuthorizationRequestToken(userDataForToken);

  try {
    const authorizationData =
      await fetchAuthorizationApiToken(refreshTokenSisman);

    if (authorizationData) {
      logger.info(`Token Sisman renovado com sucesso`);
      return {
        ...token,
        accessTokenSisman: authorizationData.access_token,
        expiresAtSisman: Math.floor(
          Date.now() / 1000 + (authorizationData.expires_in || 3600)
        ), // Calcula a nova expiração
        error: undefined // Limpa qualquer erro anterior
      };
    }

    return {
      ...token,
      error: 'RefreshSismanAccessTokenError'
    };
  } catch (error) {
    logger.error('Error refreshing Sisman access_token', error);
    // Retorna o token original com um erro para indicar a falha na renovação
    return { ...token, error: 'RefreshSismanAccessTokenError' };
  }
}
