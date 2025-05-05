import { signOut } from 'next-auth/react';

// ---> Defina a URL de logout do provedor (UFRN) <---
// É uma boa prática usar uma variável de ambiente pública para isso
const UFRN_LOGOUT_URL =
  process.env.NEXT_PUBLIC_UFRN_LOGOUT_URL ||
  'https://autenticacao.info.ufrn.br/authz-server/j_spring_cas_security_logout';

// ---> Função para lidar com o logout manual <---
const handleManualSignOut = async () => {
  // ---> Ponto de atenção: Parâmetro de redirecionamento <---
  // O código Java *não* mostra adição de um parâmetro 'service' ou
  // 'post_logout_redirect_uri' a esta URL específica de logout do Spring/CAS.
  // Isso pode significar que:
  //    a) Este endpoint NÃO suporta redirecionamento de volta automático.
  //       O usuário simplesmente verá uma página de logout da UFRN.
  //    b) O parâmetro é diferente (talvez 'targetUrl'?).
  // É MELHOR TESTAR SEM O PARÂMETRO PRIMEIRO.

  // URL de logout a ser usada (sem redirect por enquanto)
  // const ufrnLogoutUrlToUse = UFRN_LOGOUT_URL;

  // --- Se quiser *tentar* adicionar um parâmetro (verificar documentação UFRN!) ---
  const postUfrnLogoutRedirect = `${window.location.origin}/`;
  const ufrnLogoutUrlWithRedirect = `${UFRN_LOGOUT_URL}?service=${encodeURIComponent(postUfrnLogoutRedirect)}`; // Usando 'service' como palpite
  const ufrnLogoutUrlToUse = ufrnLogoutUrlWithRedirect; // Descomente para testar com redirect
  // ------------------------------------------------------------------------------

  try {
    // 1. Faça o logout da sessão NextAuth localmente
    await signOut({ redirect: false });

    // 2. Redirecione o navegador para a URL de logout CORRETA da UFRN
    window.location.href = ufrnLogoutUrlToUse;
  } catch (error) {
    console.error('Erro ao tentar deslogar localmente:', error);
    // Mesmo com erro local, tenta redirecionar para o logout UFRN
    window.location.href = ufrnLogoutUrlToUse;
  }
};

export default handleManualSignOut;
