import { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/oauth';
import Logger from '@/lib/logger'; // Assumindo que Logger está em '@/lib/logger'

const logger = new Logger('ufrnProvider');

export interface UFRNProfile {
  sub: string; // id-usuario
  name?: string; // nome-pessoa
  email?: string; // email
  image?: string; // url-foto
  login?: string; // login
  // Adicione outros campos que você espera do userinfo
}

export interface UFRNProviderOptions extends OAuthUserConfig<UFRNProfile> {
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  redirectUri: string;
  xApiKey: string;
}

export default function UFRNOAuthProvider(
  options: UFRNProviderOptions
): OAuthConfig<UFRNProfile> {
  return {
    id: 'ufrn',
    name: 'STI/UFRN',
    type: 'oauth',
    version: '2.0',
    checks: ['pkce', 'state'], // Adicionar PKCE para maior segurança, se suportado pela UFRN
    authorization: {
      url: options.authorizationUrl,
      params: {
        response_type: 'code',
        client_id: options.clientId,
        redirect_uri: options.redirectUri,
        scope: 'read' // Solicite escopos padrão OIDC
      }
    },
    token: {
      url: options.tokenUrl,
      params: {
        // Alguns desses podem ser padrão, mas explícito é bom
        client_id: options.clientId,
        client_secret: options.clientSecret,
        redirect_uri: options.redirectUri,
        grant_type: 'authorization_code'
      },
      async request(context) {
        logger.debug('UFRNOAuthProvider - Token Request - Contexto:', context);
        const { provider, params, checks } = context;

        const response = await fetch(provider.token!.url!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: provider.clientId as string,
            client_secret: provider.clientSecret as string,
            redirect_uri: provider.redirectUri as string,
            grant_type: 'authorization_code',
            code: params.code as string,
            code_verifier: checks.pkce as string // Se PKCE estiver habilitado
          })
        });

        const tokens = await response.json();
        if (!response.ok) {
          logger.error('UFRNOAuthProvider - Token Request - Erro:', tokens);
          throw new Error(
            tokens.error_description || 'Falha ao obter token da UFRN'
          );
        }
        logger.debug(
          'UFRNOAuthProvider - Token Request - Tokens Recebidos:',
          tokens
        );
        return { tokens };
      }
    },
    userinfo: {
      url: options.userInfoUrl,
      async request({ tokens }) {
        logger.debug('UFRNOAuthProvider - Userinfo Request - Tokens:', tokens);

        if (!tokens.access_token) {
          logger.error(
            'UFRNOAuthProvider - Userinfo Request - Access token ausente.'
          );
          throw new Error('Access token ausente para buscar userinfo da UFRN.');
        }

        const userInfoResponse = await fetch(options.userInfoUrl, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'X-API-Key': options.xApiKey
          }
        });

        if (!userInfoResponse.ok) {
          const errorData = await userInfoResponse.text();
          logger.error('UFRNOAuthProvider - Userinfo Request - Erro:', {
            status: userInfoResponse.status,
            data: errorData
          });
          throw new Error(
            `Falha ao buscar userinfo da UFRN: ${userInfoResponse.status}`
          );
        }

        const userInfo = await userInfoResponse.json();
        logger.debug(
          'UFRNOAuthProvider - Userinfo Request - UserInfo Recebido:',
          userInfo
        );

        // Mapeamento dos campos do userinfo da UFRN para UFRNProfile
        return {
          sub: userInfo['id-usuario']?.toString(), // Garanta que é string
          name: userInfo['nome-pessoa'] || '',
          email: userInfo.email || '',
          image: userInfo['url-foto'] || '',
          login: userInfo.login || ''
        };
      }
    },
    profile(profile: UFRNProfile, tokens) {
      logger.debug('UFRNOAuthProvider - Profile Callback - Profile:', profile);
      logger.debug('UFRNOAuthProvider - Profile Callback - Tokens:', tokens);

      // O id_token já deve ser decodificado e verificado pelo NextAuth se o escopo 'openid' for usado
      // e o provider OIDC retornar um id_token válido.
      // Se o id_token não estiver presente ou for incompleto, usamos os dados do userinfo (profile)
      // NextAuth espera que o `id` seja o identificador único do usuário.
      return {
        id: profile.sub, // `sub` do userinfo é o `id-usuario`
        name: profile.name,
        email: profile.email,
        image: profile.image,
        login: profile.login
      };
    },
    ...options // Espalha o restante das opções, como clientId e clientSecret
  };
}
