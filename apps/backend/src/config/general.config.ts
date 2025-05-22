// AUTHORIZATION_JWT_SECRET=jPxX2U&)Y<Sz5M5Yml#L024m7aG|#8sJpe[3pE8v[i,s*|0A+}
// ENV=dev
// JWT_SECRET=.Y+u!+=j8_XVUT27<?Dc9x].cKjf5wEY
// NEXTAUTH_SECRET=&Iv4fB00f~C<b£E2W&pL
// SISMAN_API_URL=http://localhost:3080
// UFRN_API_URL=https://api.info.ufrn.br
// UFRN_AUTH_BASE_URL=https://autenticacao.info.ufrn.br
// UFRN_AUTH_URL=https://autenticacao.info.ufrn.br/authz-server/oauth/authorize
// UFRN_CLIENT_ID=sisman-PiSE5Cd8xVL5XdtX
// UFRN_CLIENT_SECRET=0OIPKWMhModROWylZSof3DFCuKOzG6YU
// UFRN_TOKEN_URL=https://autenticacao.info.ufrn.br/authz-server/oauth/token
// UFRN_USERINFO_URL=https://api.info.ufrn.br/usuario/v1/usuarios/info
// UFRN_XAPI_KEY=0lEW7j70BfvWRpUGuB3NmYZbyQ5L43PK

import { registerAs } from '@nestjs/config';

interface GeneralConfig {
  appName: string;
  appLogoUrl: string;
  appPrimaryColor?: string;
  appSecondaryColor?: string;
  appFrontendUrl?: string;
  magicLinkCallbackUrl?: string;
  magicLinkExpiresMinutes?: number;
}

export default registerAs(
  'general',
  (): GeneralConfig => ({
    appName: process.env.APP_NAME || 'SISMAN',
    appLogoUrl:
      process.env.APP_LOGO_URL ||
      'https://www.ufrn.br/resources/documentos/identidadevisual/logotipo/logotipo_sem-legenda.png',
    appPrimaryColor: '#001a4c',
    appFrontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3000',
    magicLinkCallbackUrl:
      process.env.MAGIC_LINK_CALLBACK_URL ||
      `${process.env.APP_FRONTEND_URL || 'http://localhost:3000'}/callback/magic-link`,
    magicLinkExpiresMinutes: 10
  })
);
