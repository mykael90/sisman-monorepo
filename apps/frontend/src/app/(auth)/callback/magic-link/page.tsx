// app/callback/magic-link/page.tsx
import MagicLinkVerifierClient from './components/magic-link-verifier-client'; // Ajuste o caminho se necessário
import { redirect } from 'next/navigation';

// A tipagem fornecida no problema
type SearchParams = Promise<{
  email?: string;
  code?: string;
  callbackUrl?: string;
  error?: string; // Para erros passados pelo NextAuth via URL
}>;

export default async function MagicLinkCallbackPage(props: {
  // No App Router, searchParams é diretamente um objeto, não uma Promise.
  // A tipagem original "Promise<>" pode ser de um contexto diferente ou versão mais antiga.
  // Para Next.js 14+ App Router, é direto.
  searchParams: SearchParams;
}) {
  const {
    email,
    code,
    callbackUrl: initialCallbackUrl,
    error: initialError
  } = await props.searchParams;

  const callbackUrl = initialCallbackUrl || '/'; // Define um callbackUrl padrão se não fornecido

  // Se houver um erro já na URL (ex: vindo de uma tentativa anterior ou do NextAuth)
  if (initialError) {
    // Se o erro específico for MagicLinkExpired, podemos mostrar uma mensagem customizada
    // ou simplesmente redirecionar para a raiz com o erro, como faremos abaixo.
    // Aqui, vamos considerar que o erro 'MagicLinkExpired' será setado pela lógica do signIn
    // mas se ele vier diretamente na URL, tratamos também.
    if (initialError === 'MagicLinkExpired') {
      // Poderia renderizar uma UI específica aqui ou redirecionar
      // Para consistência com o requisito de redirecionar em caso de expiração:
      redirect(`/signin?error=MagicLinkExpired&callbackUrl=${callbackUrl}`);
    }
    // Para outros erros iniciais, redireciona para a raiz com o erro.
    // Ex: return <div>Erro: {initialError}</div>; ou
    redirect(
      `/signin?error=${encodeURIComponent(initialError)}&callbackUrl=${callbackUrl}`
    );
    // É importante retornar algo ou chamar redirect() para evitar que o restante do código execute.
    // redirect() lança uma exceção especial, então o return null abaixo não seria alcançado.
  }

  // Validar se os parâmetros essenciais estão presentes
  if (!email || !code) {
    console.error('Parâmetros do link mágico ausentes: email ou code');
    // Redireciona para a raiz com um erro genérico de parâmetros inválidos
    redirect('/?error=InvalidMagicLinkParams');
    // Novamente, redirect() termina a execução aqui.
  }

  // Passa os parâmetros para o componente cliente que fará a chamada signIn
  return (
    <MagicLinkVerifierClient
      email={email}
      code={code}
      callbackUrl={callbackUrl}
    />
  );
}
