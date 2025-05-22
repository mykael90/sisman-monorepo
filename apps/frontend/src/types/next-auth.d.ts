import NextAuth, {
  AuthOptions,
  Profile,
  User as NextAuthUser,
  Account
} from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

// Tipagem para o objeto user do NextAuth, estendendo com campos customizados
interface ExtendedUser extends NextAuthUser {
  login?: string;
  // Para magic link, o provider de credentials retorna isso
  accessTokenSisman?: string;
  expiresInSisman?: number;
  roles?: number[];
  authorizationError?: string;
  error?: string;
}

// Tipagem para o token JWT
interface ExtendedJWT extends JWT, DefaultJWT {
  id?: string; // O ID do usuário (pode ser sub ou id do AdapterUser)
  login?: string | null;
  provider?: string;
  // UFRN
  accessTokenUfrn?: string;
  refreshTokenUfrn?: string;
  expiresAtUfrn?: number;
  // SISMAN (via UFRN auth ou Magic Link)
  idSisman?: string;
  accessTokenSisman?: string;
  expiresAtSisman?: number;
  roles?: number[];
  authorizationError?: string;
  // Erro genérico do NextAuth (ex: RefreshAccessTokenError)
  error?: string;
}

// Tipagem para a sessão
declare module 'next-auth' {
  interface Session {
    user: {
      idUfrn?: string; // ou id do usuário, dependendo do provedor
      idSisman?: string;
      login?: string | null;
      roles?: number[];
      // campos padrão do NextAuth (name, email, image) já estão aqui
    } & NextAuthUser; // Inclui name, email, image
    provider?: string;
    accessTokenUfrn?: string | null;
    refreshTokenUfrn?: string | null; // Evite expor refresh tokens para o client, se possível
    accessTokenSisman?: string | null;
    authorizationError?: string;
    error?: string; // Erro genérico do NextAuth (ex: RefreshAccessTokenError)
  }
}
declare module 'next-auth/jwt' {
  interface JWT extends ExtendedJWT {}
}
