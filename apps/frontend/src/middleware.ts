// src/middleware.ts
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import Logger from '@/lib/logger';

const logger = new Logger('Middleware');

export default withAuth(
  // `withAuth` aprimora sua Request com o token do usuário.
  function middleware(req: NextRequestWithAuth) {
    const { method, url } = req;
    const start = Date.now();
    const pathname = req.nextUrl.pathname;

    logger.debug(`Request START: ${method} ${pathname}`, {
      req: { method, url }
    });

    logger.debug('Token no middleware:', req.nextauth.token); // Log para depuração

    // --- Lógica de Logout e Redirecionamento por Erro de Refresh ---
    const refreshErrorResponse = handleRefreshError(req, start);
    if (refreshErrorResponse) {
      // Se handleRefreshError retornou uma resposta (ou seja, houve erro),
      // retorna essa resposta imediatamente.
      return refreshErrorResponse;
    }
    // --- Fim da Lógica ---

    // Exemplo: Redirecionar se não for admin e tentar acessar /admin
    // if (
    //   pathname.startsWith('/admin') &&
    //   req.nextauth.token?.role !== 'admin'
    // ) {
    //   logger.warn(`Acesso negado à rota /admin para usuário sem role 'admin'. Redirecionando para /denied.`);
    //   const deniedUrl = new URL('/denied', req.url);
    //   const response = NextResponse.rewrite(deniedUrl); // Usar rewrite para manter a URL original na barra de endereço
    //   const duration = Date.now() - start;
    //   logger.info(
    //     `Middleware END (Denied Access): ${method} ${pathname} in ${duration}ms`,
    //     { req: { method, url }, duration, rewrite: deniedUrl.toString() }
    //   );
    //   return response;
    // }

    // Se não houve erro de refresh e nenhuma outra condição de redirecionamento/rewrite foi atendida,
    // permite que a requisição continue normalmente.
    const response = NextResponse.next();
    const duration = Date.now() - start;
    logger.debug(
      `Middleware END (Allowed): ${method} ${pathname} in ${duration}ms`,
      {
        req: { method, url },
        duration
      }
    );
    return response;
  },
  {
    callbacks: {
      // O middleware só será executado se houver um token (mesmo que contenha um erro).
      // A lógica *dentro* da função middleware decide o que fazer com base no token.
      authorized: ({ token }) => !!token
    },
    pages: {
      // Página para onde o `withAuth` redireciona por padrão se `authorized` retornar false
      // (ou seja, se não houver token algum).
      signIn: '/signin'
      // Você pode adicionar outras páginas como error: '/auth/error'
    }
  }
);

// Configuração do Matcher: Aplica o middleware a TODAS as rotas, EXCETO as especificadas.
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas exceto pelas que começam com:
     * - api (Rotas de API)
     * - _next/static (Arquivos estáticos)
     * - _next/image (Arquivos de otimização de imagem)
     * - favicon.ico (Arquivo de favicon)
     * - signin (Sua página de login)
     * E que terminam com extensões comuns de assets (adicione mais se necessário)
     * OU caminhos específicos como /images, /fonts etc.
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|signin|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    // Alternativa se seus assets estiverem em pastas específicas:
    // '/((?!api|_next/static|_next/image|favicon.ico|signin|images/|icons/).*)',
  ]
};

// Função auxiliar para obter o nome correto do cookie de sessão
function getSessionCookieName(): string {
  const securePrefix = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Secure-'
    : '';
  return (
    process.env.NEXTAUTH_SESSION_COOKIE_NAME ||
    `${securePrefix}next-auth.session-token`
  );
}

/**
 * Lida com o erro de refresh de token, forçando logout e redirecionando para signin.
 * @param req A requisição original.
 * @param start O timestamp de início da requisição.
 * @returns Uma NextResponse de redirecionamento se o erro ocorreu, caso contrário null.
 */
function handleRefreshError(
  req: NextRequestWithAuth,
  start: number
): NextResponse | null {
  const { method, url } = req;
  const pathname = req.nextUrl.pathname;
  const token = req.nextauth.token;

  if (token?.error === 'RefreshAccessTokenError') {
    logger.warn(
      `Erro de RefreshAccessToken detectado. Forçando logout e redirecionando para /signin.`
    );

    // 1. Preparar o redirecionamento para a página de login
    const signInUrl = new URL('/signin', req.url);

    // signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname); // Preserva a URL original
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    signInUrl.searchParams.set('callbackUrl', callbackUrl);

    signInUrl.searchParams.set('error', 'SessionExpired'); // Adiciona parâmetro de erro

    // Cria a resposta de redirecionamento
    const response = NextResponse.redirect(signInUrl);

    // 2. Efetuar o "logout" invalidando a sessão atual (removendo o cookie)
    const sessionCookieName = getSessionCookieName();
    logger.info(`Tentando remover o cookie de sessão: ${sessionCookieName}`);
    response.cookies.delete({
      name: sessionCookieName,
      path: '/'
      // Adicione outros atributos se necessário (domain, secure, httpOnly, sameSite)
    });

    const duration = Date.now() - start;
    logger.info(
      `Middleware END (Forcing Re-Login): ${method} ${pathname} in ${duration}ms`,
      { req: { method, url }, duration, redirect: signInUrl.toString() }
    );

    // Retorna a resposta que redireciona o usuário e remove o cookie
    return response;
  }

  // Se não houve erro de refresh, retorna null para continuar o fluxo normal
  return null;
}
