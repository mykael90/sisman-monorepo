import CredentialsProvider, {
  CredentialsConfig
} from 'next-auth/providers/credentials';
import Logger from '@/lib/logger';
import { authConfig } from '../config/auth.config';

const logger = new Logger('magicLinkCredentialsProvider');

/**
 * Configuração do CredentialsProvider para verificar o código do link mágico
 * com o backend NestJS.
 */
export const magicLinkCredentialsProviderConfig: CredentialsConfig = {
  id: 'magic-link-verifier',
  name: 'Magic Link Verifier',
  type: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    code: { label: 'Code', type: 'text' }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.code) {
      logger.error('Email ou código ausente.');
      return null;
    }

    const { email, code } = credentials;

    try {
      const response = await fetch(
        `${authConfig.sisman.apiUrl}/auth/magic-link/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Erro desconhecido do backend.' }));
        logger.error(
          `Backend falhou na verificação: ${response.status} - ${errorData.message || 'Sem mensagem de erro específica.'}`
        );
        // Em vez de retornar null, lançar um erro para NextAuth exibir ao usuário
        throw new Error(errorData.message || 'Código inválido ou expirado.');
      }

      const user = await response.json(); // Backend retorna { id, email, name, access_token, expires_in, login, ... }

      if (user && user.id) {
        logger.info(`Usuário autenticado via backend: ${user.email}`);
        // O provider de credentials deve retornar um objeto que será armazenado no token JWT.
        // Inclua aqui os campos que você quer no token vindos do backend.
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          login: user.login,
          image: user.image,
          // Importante: dados para o JWT callback para criar o accessTokenSisman
          accessTokenSisman: user.access_token,
          expiresInSisman: user.expires_in,
          roles: user.roles
          // Outros campos retornados pelo backend que você queira passar para o JWT
        };
      } else {
        logger.error(
          'Backend não retornou um usuário válido após verificação.'
        );
        throw new Error('Falha na autenticação. Usuário não encontrado.');
      }
    } catch (error: any) {
      logger.error('Erro ao contatar o backend para verificação:', error);
      // Repassar o erro para NextAuth
      throw new Error(error.message || 'Erro ao verificar o link mágico.');
    }
  }
};

// Não é necessário exportar `CredentialsProvider(magicLinkCredentialsProviderConfig)` aqui.
// Apenas a configuração será importada em authOptions.
