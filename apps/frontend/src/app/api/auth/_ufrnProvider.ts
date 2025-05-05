import { OAuthUserConfig, OAuthConfig } from 'next-auth/providers/oauth';
import Logger from '@/lib/logger';

export interface UFRNProfile {
  sub: string;
  name?: string;
  email?: string;
  image?: string;
  login?: string;
}

// Define the optionsComplement interface
interface optionsComplement {
  authorizationUrl?: string;
  tokenUrl?: string;
  redirectUri?: string;
}

const logger = new Logger('stiProvider');

export default function UFRNOAuthProvider<P extends UFRNProfile>(
  options: OAuthUserConfig<P> & optionsComplement
): OAuthConfig<P> {
  return {
    id: 'ufrn',
    name: 'STI/UFRN',
    type: 'oauth',
    version: '2.0',
    authorization: {
      url: options.authorizationUrl,
      params: {
        response_type: 'code',
        client_id: options.clientId,
        redirect_uri: options.redirectUri,
        scope: 'read' // Use openid para garantir um ID Token
      }
    },
    token: {
      url: options.tokenUrl,
      params: {
        client_id: options.clientId,
        client_secret: options.clientSecret,
        redirect_uri: options.redirectUri,
        grant_type: 'authorization_code'
      },
      async request(context) {
        logger.info(`
--------------------------------------------------
UFRNOAuthProvider - Token Request - Contexto
--------------------------------------------------

${JSON.stringify(context, null, 2)}
`);
        const { provider, params } = context;
        if (!provider.token) {
          throw new Error('Provider token URL is missing.');
        }
        const response = await fetch(provider.token?.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: provider.clientId as string,
            client_secret: provider.clientSecret as string,
            redirect_uri: provider.redirectUri as string,
            grant_type: 'authorization_code',
            code: params.code as string
          })
        });

        const tokens = await response.json();
        logger.info(`
--------------------------------------------------
UFRNOAuthProvider - Token Request - Tokens Recebidos
--------------------------------------------------

${JSON.stringify(tokens, null, 2)}
`);
        return { tokens };
      }
    },
    userinfo: {
      async request({ tokens }) {
        logger.info(`
--------------------------------------------------
UFRNOAuthProvider - Userinfo Request - Tokens Recebidos
--------------------------------------------------

${JSON.stringify(tokens, null, 2)}
`);

        if (!process.env.UFRN_USERINFO_URL) {
          throw new Error('UFRN_USERINFO_URL environment variable is missing.');
        }
        if (!process.env.UFRN_XAPI_KEY) {
          throw new Error('UFRN_XAPI_KEY environment variable is missing.');
        }

        const userInfoResponse = await fetch(process.env.UFRN_USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'X-API-Key': process.env.UFRN_XAPI_KEY
          }
        });

        const userInfo = await userInfoResponse.json();

        logger.info(`
--------------------------------------------------
UFRNOAuthProvider - Userinfo Request - UserInfo Recebido
--------------------------------------------------

${JSON.stringify(userInfo, null, 2)}
`);

        return {
          sub: userInfo['id-usuario'],
          name: userInfo['nome-pessoa'] || '',
          email: userInfo.email || '',
          image: userInfo['url-foto'] || '',
          login: userInfo.login || ''
        };
      }
    },
    profile(profile, tokens) {
      logger.info(`
--------------------------------------------------
UFRNOAuthProvider - Profile - Profile Recebido
--------------------------------------------------

${JSON.stringify(profile, null, 2)}
`);
      logger.info(`
--------------------------------------------------
UFRNOAuthProvider - Profile - Tokens Recebidos
--------------------------------------------------
${JSON.stringify(tokens, null, 2)}`);

      type Decoded = {
        sub: string;
        name?: string;
        email?: string;
        image?: string;
        login?: string;
      };

      let decoded: Decoded = {
        sub: '',
        name: '',
        email: '',
        image: '',
        login: ''
      };

      if (tokens.id_token) {
        decoded = JSON.parse(
          Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
        );
      } else {
        logger.warn(`
--------------------------------------------------
UFRNOAuthProvider - Profile - ID Token Não Encontrado
--------------------------------------------------

ID Token: ${tokens.id_token}
`);
        // Use the sub from the userinfo response (profile)
        decoded = {
          sub: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.image,
          login: profile.login
        };
      }

      return {
        id: decoded.sub,
        name: decoded.name || '',
        email: decoded.email || '',
        image: decoded.image || '',
        login: decoded.login || ''
      };
    },

    options
  };
}
