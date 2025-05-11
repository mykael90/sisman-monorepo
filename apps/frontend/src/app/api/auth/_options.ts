import UFRNOAuthProvider from './_ufrnProvider';
import { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { AdapterUser } from 'next-auth/adapters';
import { JWT, encode, decode } from 'next-auth/jwt';
import Logger from '@/lib/logger';
import { handleAuthorizationLogic } from '@/src/lib/auth/authorization-sisman';
import refreshUfrnAccessToken from '../../../lib/auth/refresh-ufrn-access-token';
import refreshSismanAccessToken from '../../../lib/auth/refresh-sisman-access-token';

const logger = new Logger('authOptions');

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    }),
    UFRNOAuthProvider({
      clientId: process.env.UFRN_CLIENT_ID as string,
      clientSecret: process.env.UFRN_CLIENT_SECRET as string,
      authorizationUrl: process.env.UFRN_AUTH_URL,
      tokenUrl: process.env.UFRN_TOKEN_URL,
      redirectUri: process.env.UFRN_REDIRECT_URI
    })
  ],
  pages: {
    signIn: '/signin'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // ... (código do signIn inalterado)
      logger.debug(`
--------------------------------------------------
signIn Callback - Dados Recebidos
--------------------------------------------------
User: ${JSON.stringify(user, null, 2)}
Account: ${JSON.stringify(account, null, 2)}
Profile: ${JSON.stringify(profile, null, 2)}
--------------------------------------------------
`);
      return true;
    },
    async redirect({ url, baseUrl }) {
      // ... (código do redirect inalterado)
      logger.debug(`
--------------------------------------------------
Redirect Callback - Dados Recebidos
--------------------------------------------------
URL: ${JSON.stringify(url, null, 2)}
Base URL: ${JSON.stringify(baseUrl, null, 2)}
--------------------------------------------------
`);
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({
      token,
      user,
      account,
      profile
    }: {
      token: JWT;
      user?: AdapterUser | any;
      account?: any;
      profile?: any;
    }): Promise<JWT> {
      logger.debug(`
--------------------------------------------------
JWT Callback - Dados Recebidos (Antes do Processamento)
--------------------------------------------------
Token: ${JSON.stringify(token, null, 2)}
User: ${JSON.stringify(user, null, 2)}
Account: ${JSON.stringify(account, null, 2)}
Profile: ${JSON.stringify(profile, null, 2)}
--------------------------------------------------
`);

      let processedToken = token; // Usar uma variável temporária

      // 1. Login Inicial ou Primeira Chamada JWT pós-login
      if (account && user) {
        logger.debug(
          `Primeiro acesso ou chamada inicial, processando dados do provedor e autorização.`
        );
        processedToken = {
          ...processedToken,
          id: user.id,
          accessTokenUfrn: account.access_token, // Token do provedor (UFRN)
          refreshTokenUfrn: account.refresh_token, // Refresh token do provedor (UFRN)
          expiresAtUfrn: account.expires_at, // Expiração do token do provedor (UFRN)
          provider: account.provider,
          login: user.login // Adiciona o login, se existir
        };

        // Lógica de autorização delegada a API Sisman
        const authorizationFields = await handleAuthorizationLogic(user);
        processedToken = { ...processedToken, ...authorizationFields };
      }
      // 2. Validação/Renovação do Token UFRN (se aplicável e expirado)
      // Verifica se o token UFRN está expirado (não pode ser na primeira chamada, pois account não existirá)
      if (
        !account &&
        processedToken.provider === 'ufrn' &&
        Date.now() >= Number(processedToken.expiresAtUfrn) * 1000
      ) {
        logger.warn(
          'Token UFRN expirado ou inválido, tentando renovar/revalidar...'
        );
        processedToken = await refreshUfrnAccessToken(processedToken);
      }
      // 3. Validação/Renovação do Token SISMAN (TODO)
      // Verifica se o token SISMAN está expirado (não pode ser na primeira chamada, pois account não existirá)
      // E também verifica se existe um expiresAtSisman, pois pode não existir se o login inicial falhou na autorização
      if (
        !account &&
        processedToken.expiresAtSisman &&
        Date.now() >= Number(processedToken.expiresAtSisman) * 1000
      ) {
        /* condição de expiração do token SISMAN expiresAtAuthorization */
        logger.warn(
          'Token SISMAN expirado ou inválido, tentando renovar/revalidar...'
        );
        processedToken = await refreshSismanAccessToken(processedToken); // Função a ser criada
      }

      logger.debug(`
--------------------------------------------------
JWT Callback - Token Após Processamento
--------------------------------------------------
Token: ${JSON.stringify(processedToken, null, 2)}
--------------------------------------------------
`);
      return processedToken; // Retorna o token processado
    },
    async session({ session, token, user }) {
      // ... (código do session inalterado, mas agora recebe o token potencialmente atualizado)
      logger.debug(`
--------------------------------------------------
Session Callback - Dados Recebidos (Antes do Processamento)
--------------------------------------------------
Session: ${JSON.stringify(session, null, 2)}
Token: ${JSON.stringify(token, null, 2)}
--------------------------------------------------
`);
      // Mapeia os dados do JWT (token) para o objeto `session`
      session.user.idUfrn = (token.sub || token.id) as string;
      session.user.login = token.login as string | undefined;
      session.provider = token.provider as string | undefined;

      // Expõe dados da API de autenticação - UFRN
      session.accessTokenUfrn = token.accessTokenUfrn as string | null;
      session.refreshTokenUfrn = token.refreshTokenUfrn as string | null;

      // Expõe dados da API de autorização - SISMAN
      session.user.idSisman = token.idSisman as string | undefined;
      session.accessTokenSisman = token.accessTokenSisman as string | null;
      session.roles = token.roles as string[] | undefined;
      session.authorizationError = token.authorizationError as
        | string
        | undefined;

      // Expõe erro genérico do next-auth (incluindo erros de refresh)
      session.error = token.error as string | undefined;

      logger.debug(`
--------------------------------------------------
Session Callback - Session Após Processamento
--------------------------------------------------
Session: ${JSON.stringify(session, null, 2)}
--------------------------------------------------
`);
      return session;
    }
  },
  jwt: {
    // ... (encode/decode inalterados)
    encode: async ({ secret, token, maxAge }) => {
      logger.debug(
        `JWT Encode - Payload a ser codificado/criptografado: ${JSON.stringify(token, null, 2)}`
      );
      const encodedToken = await encode({ secret, token, maxAge });
      logger.debug(`JWT Encode - Token JWE/JWS gerado: ${encodedToken}`);
      return encodedToken;
    },
    decode: async ({ secret, token }) => {
      logger.debug(
        `JWT Decode - Token JWE/JWS recebido para decodificar: ${token}`
      );
      const decodedPayload = await decode({ secret, token });
      logger.debug(
        `JWT Decode - Payload decodificado/descriptografado: ${JSON.stringify(decodedPayload, null, 2)}`
      );
      return decodedPayload;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
  // adapter: MongoDBAdapter(clientPromise)
};
