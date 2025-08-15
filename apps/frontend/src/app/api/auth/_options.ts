import { AuthOptions, Profile, Account } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { encode, decode } from 'next-auth/jwt';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials'; // Importar diretamente

import Logger from '@/lib/logger';
import { authConfig, isGithubProviderConfigured } from './config/auth.config';

// Nossos provedores e configs customizados
import UFRNOAuthProvider, { UFRNProfile } from './providers/_ufrn-provider';
import { magicLinkCredentialsProviderConfig } from './providers/_magic-link-credentials-provider';

// Funções auxiliares
import { handleAuthorizationLogic } from '@/lib/auth/authorization-sisman';
import refreshSismanAccessToken from '@/lib/auth/refresh-sisman-access-token';
import refreshUfrnAccessToken from '@/lib/auth/refresh-ufrn-access-token';
import { ExtendedJWT, ExtendedUser } from '../../../types/next-auth';

const logger = new Logger('authOptions');

export const authOptions: AuthOptions = {
  providers: [
    // Provedor de Credentials para verificar o código do link mágico
    CredentialsProvider(magicLinkCredentialsProviderConfig),

    // Provedor UFRN
    UFRNOAuthProvider({
      clientId: authConfig.ufrn.clientId,
      clientSecret: authConfig.ufrn.clientSecret,
      authorizationUrl: authConfig.ufrn.authorizationUrl,
      tokenUrl: authConfig.ufrn.tokenUrl,
      redirectUri: authConfig.ufrn.redirectUri,
      userInfoUrl: authConfig.ufrn.userInfoUrl,
      xApiKey: authConfig.ufrn.xApiKey
    }),

    // Provedor GitHub (opcional, apenas se configurado)
    ...(isGithubProviderConfigured
      ? [
          GithubProvider({
            clientId: authConfig.github.clientId as string, // Type assertion é segura devido a isGithubProviderConfigured
            clientSecret: authConfig.github.clientSecret as string
          })
        ]
      : [])

    // Provedor de Email padrão do NextAuth (para iniciar o fluxo, se desejado)
    // Se você tem uma UI para enviar o link, pode não precisar deste.
    // EmailProvider(emailMagicLinkProviderConfig), // Descomente e configure se necessário
  ],
  pages: {
    signIn: '/signin'
    // error: '/auth/error', // Opcional: página para exibir erros de autenticação
  },
  session: {
    strategy: 'jwt',
    maxAge: authConfig.sessionMaxAge
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      logger.debug('signIn Callback', { user, account, profile });
      // Lógica de signIn, se houver alguma restrição específica.
      // Por exemplo, verificar se o email é de um domínio permitido.
      return true;
    },
    async redirect({ url, baseUrl }) {
      logger.debug('Redirect Callback', { url, baseUrl });
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({
      token,
      user,
      account,
      profile
    }: {
      token: ExtendedJWT;
      user?: AdapterUser | ExtendedUser;
      account?: Account | null;
      profile?: Profile;
    }): Promise<ExtendedJWT> {
      logger.debug('JWT Callback - Antes', {
        token: {
          ...token
          // accessTokenUfrn: 'HIDDEN',
          // refreshTokenUfrn: 'HIDDEN',
          // accessTokenSisman: 'HIDDEN'
        },
        user,
        account,
        profileName: profile?.name
      });

      const typedUser = user as ExtendedUser | undefined; // Cast para o tipo estendido

      // 1. Login Inicial ou Primeira Chamada JWT pós-login
      if (account && typedUser) {
        token.provider = account.provider;
        // token.id = typedUser.id; // O id do usuário já deve ser definido pelo provider
        token.login =
          typedUser.login || (profile as UFRNProfile)?.login || typedUser.email; // Priorizar login, depois perfil, depois email
        token.name = typedUser.name || profile?.name;
        token.email = typedUser.email || profile?.email;
        token.picture = typedUser.image || profile?.image;

        if (account.provider === 'ufrn') {
          token.accessTokenUfrn = account.access_token;
          token.refreshTokenUfrn = account.refresh_token;
          token.expiresAtUfrn = account.expires_at;

          // Lógica de autorização delegada à API Sisman (somente para UFRN)
          const authorizationFields = await handleAuthorizationLogic(typedUser); // Passar account para ter mais contexto se necessário
          token = { ...token, ...authorizationFields };
        } else if (account.provider === 'magic-link-verifier') {
          // ID do provider de credentials
          // O provider de credentials já deve ter retornado accessTokenSisman e expiresInSisman
          if (typedUser.accessTokenSisman) {
            token.accessTokenSisman = typedUser.accessTokenSisman;
            token.expiresAtSisman = Math.floor(
              Date.now() / 1000 + (typedUser.expiresInSisman || 3600)
            );
            token.idSisman = typedUser.id; // Assumindo que o ID do usuário do magic link é o idSisman
            token.roles = typedUser.roles;
            token.maintenanceInstance = typedUser.maintenanceInstance;
            token.maintenanceInstanceId = typedUser.maintenanceInstanceId;
            // Aqui você pode querer buscar 'roles' ou outros dados do Sisman se não vieram no 'authorize'
          } else {
            logger.warn('Magic link verifier não retornou accessTokenSisman.');
            token.authorizationError =
              'Falha ao obter token do Sisman via Magic Link.';
          }
        } else if (account.provider === 'github') {
          // Lógica específica para GitHub, se necessário
          // Ex: token.accessTokenGithub = account.access_token;
          // Potencialmente, chamar handleAuthorizationLogic também se usuários GitHub puderem ser autorizados no Sisman
        }
      }

      // 2. Validação/Renovação de Tokens (se não for a primeira chamada)
      if (!account) {
        // Só tentar renovar se não for o fluxo de login inicial
        // Token UFRN
        if (
          token.provider === 'ufrn' &&
          token.expiresAtUfrn &&
          Date.now() >= token.expiresAtUfrn * 1000
        ) {
          logger.warn('Token UFRN expirado, tentando renovar...');
          token = await refreshUfrnAccessToken(token);
        }
        // Token SISMAN
        if (
          token.expiresAtSisman &&
          Date.now() >= token.expiresAtSisman * 1000
        ) {
          logger.warn('Token SISMAN expirado, tentando renovar...');
          // Apenas renovar se houver um accessTokenSisman (evitar renovar se o original falhou)
          // e se houver um refresh token para o Sisman (que não está sendo tratado aqui)
          // ou se a renovação do Sisman é baseada no token UFRN ou outra lógica.
          if (token.accessTokenSisman) {
            token = await refreshSismanAccessToken(token); // Precisa ser implementado corretamente
          }
        }
      }

      // Se algum refresh token falhou, o campo `error` no token será populado.
      // Isso será passado para a sessão.

      logger.debug('JWT Callback - Depois', {
        token: {
          ...token
          // accessTokenUfrn: 'HIDDEN',
          // refreshTokenUfrn: 'HIDDEN',
          // accessTokenSisman: 'HIDDEN'
        }
      });
      return token;
    },
    async session({ session, token }) {
      logger.debug('Session Callback - Antes', {
        session,
        token: {
          ...token
          // accessTokenUfrn: 'HIDDEN',
          // refreshTokenUfrn: 'HIDDEN',
          // accessTokenSisman: 'HIDDEN'
        }
      });

      // Mapeia os dados do JWT (token) para o objeto `session`
      // Dados do usuário básico
      session.user.id = token.id as string; // ID principal usado pelo NextAuth (sub ou id do adapter)
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture; // 'picture' do JWT é 'image' na sessão

      // Dados específicos
      session.user.idUfrn =
        token.provider === 'ufrn' ? token.sub || token.id : undefined; // id-usuario da UFRN
      session.user.login = token.login;
      session.provider = token.provider;

      // Expõe dados da API de autenticação - UFRN
      session.accessTokenUfrn = token.accessTokenUfrn || null;
      // session.refreshTokenUfrn = token.refreshTokenUfrn || null; // Geralmente não se expõe refresh_token ao cliente

      // Expõe dados da API de autorização - SISMAN
      session.user.idSisman = token.idSisman;
      session.accessTokenSisman = token.accessTokenSisman || null;
      session.user.roles = token.roles;
      session.user.maintenanceInstance = token.maintenanceInstance;
      session.user.maintenanceInstanceId = token.maintenanceInstanceId;
      session.authorizationError = token.authorizationError;

      // Expõe erro genérico do next-auth (incluindo erros de refresh)
      session.error = token.error;

      // Se houver um erro de RefreshAccessTokenError, a sessão pode ser considerada inválida.
      // O frontend pode usar session.error para deslogar o usuário ou mostrar uma mensagem.
      if (
        token.error === 'RefreshAccessTokenErrorUFRN' ||
        token.error === 'RefreshAccessTokenErrorSisman'
      ) {
        // Aqui você pode querer limpar os tokens da sessão para forçar o logout
        // ou deixar que o frontend decida o que fazer com base no session.error
        logger.warn('Erro de refresh token detectado na sessão:', token.error);
      }

      logger.debug('Session Callback - Depois', { session });
      return session;
    }
  },
  jwt: {
    encode: async ({ secret, token, maxAge }) => {
      logger.debug('JWT Encode - Payload', {
        token: {
          ...token
          // accessTokenUfrn: 'HIDDEN',
          // refreshTokenUfrn: 'HIDDEN',
          // accessTokenSisman: 'HIDDEN'
        }
      });
      const encodedToken = await encode({ secret, token, maxAge });
      // logger.debug(`JWT Encode - Token JWE/JWS gerado: ${encodedToken}`); // Muito verboso
      return encodedToken;
    },
    decode: async ({ secret, token }) => {
      // logger.debug(`JWT Decode - Token JWE/JWS recebido: ${token}`); // Muito verboso
      if (!token) {
        logger.error('JWT Decode - Token para decodificar é undefined ou null');
        return null;
      }
      const decodedPayload = await decode({ secret, token });
      logger.debug('JWT Decode - Payload', {
        token: {
          ...decodedPayload
          // accessTokenUfrn: 'HIDDEN',
          // refreshTokenUfrn: 'HIDDEN',
          // accessTokenSisman: 'HIDDEN'
        }
      });
      return decodedPayload;
    }
  },
  secret: authConfig.secret
  // adapter: MongoDBAdapter(clientPromise) // Se você usar um adapter de banco de dados
};
