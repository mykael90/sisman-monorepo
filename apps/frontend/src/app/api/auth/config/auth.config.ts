import { z } from 'zod';

// Schema para validar as variáveis de ambiente
const authEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET é obrigatório'),
  NEXTAUTH_SESSION_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(1 * 24 * 60 * 60), // 1 dia em segundos

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  UFRN_CLIENT_ID: z.string().min(1, 'UFRN_CLIENT_ID é obrigatório'),
  UFRN_CLIENT_SECRET: z.string().min(1, 'UFRN_CLIENT_SECRET é obrigatório'),
  UFRN_AUTH_URL: z.string().url('UFRN_AUTH_URL deve ser uma URL válida'),
  UFRN_TOKEN_URL: z.string().url('UFRN_TOKEN_URL deve ser uma URL válida'),
  UFRN_REDIRECT_URI: z
    .string()
    .url('UFRN_REDIRECT_URI deve ser uma URL válida'),
  UFRN_USERINFO_URL: z
    .string()
    .url('UFRN_USERINFO_URL deve ser uma URL válida'),
  UFRN_XAPI_KEY: z.string().min(1, 'UFRN_XAPI_KEY é obrigatório'),

  SISMAN_API_URL: z.string().url('SISMAN_API_URL deve ser uma URL válida')

  // Para o Email Provider (se você for usá-lo no futuro)
  // EMAIL_SERVER_HOST: z.string().optional(),
  // EMAIL_SERVER_PORT: z.coerce.number().optional(),
  // EMAIL_SERVER_USER: z.string().optional(),
  // EMAIL_SERVER_PASSWORD: z.string().optional(),
  // EMAIL_FROM: z.string().email().optional(),
});

// Tenta validar as variáveis de ambiente
const parsedEnv = authEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Erro de validação nas variáveis de ambiente de autenticação:',
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error('Variáveis de ambiente de autenticação inválidas.');
}

export const authConfig = {
  secret: parsedEnv.data.NEXTAUTH_SECRET,
  sessionMaxAge: parsedEnv.data.NEXTAUTH_SESSION_MAX_AGE,
  github: {
    clientId: parsedEnv.data.GITHUB_CLIENT_ID,
    clientSecret: parsedEnv.data.GITHUB_CLIENT_SECRET
  },
  ufrn: {
    clientId: parsedEnv.data.UFRN_CLIENT_ID,
    clientSecret: parsedEnv.data.UFRN_CLIENT_SECRET,
    authorizationUrl: parsedEnv.data.UFRN_AUTH_URL,
    tokenUrl: parsedEnv.data.UFRN_TOKEN_URL,
    redirectUri: parsedEnv.data.UFRN_REDIRECT_URI,
    userInfoUrl: parsedEnv.data.UFRN_USERINFO_URL,
    xApiKey: parsedEnv.data.UFRN_XAPI_KEY
  },
  sisman: {
    apiUrl: parsedEnv.data.SISMAN_API_URL
  }
  // email: {
  //   server: {
  //     host: parsedEnv.data.EMAIL_SERVER_HOST,
  //     port: parsedEnv.data.EMAIL_SERVER_PORT,
  //     auth: {
  //       user: parsedEnv.data.EMAIL_SERVER_USER,
  //       pass: parsedEnv.data.EMAIL_SERVER_PASSWORD,
  //     },
  //   },
  //   from: parsedEnv.data.EMAIL_FROM,
  // },
};

// Validação para garantir que o GitHub só é configurado se ambos ID e Secret estiverem presentes
export const isGithubProviderConfigured = !!(
  authConfig.github.clientId && authConfig.github.clientSecret
);
