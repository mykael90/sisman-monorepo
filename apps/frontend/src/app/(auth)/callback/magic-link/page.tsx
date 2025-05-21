// src/app/auth/callback/magic-link/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function MagicLinkCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const email = searchParams.get('email');
    const code = searchParams.get('code');

    if (email && code) {
      const attemptSignIn = async () => {
        const result = await signIn('credentials', {
          redirect: false, // Não redireciona automaticamente, lidamos com isso
          email,
          code
        });

        if (result?.error) {
          console.error('Sign in error:', result.error);
          // Tentar extrair uma mensagem mais amigável se o backend retornar um JSON de erro
          // (o CredentialsProvider pode não passar isso diretamente)
          setError(
            'Falha na autenticação. O link pode ser inválido ou ter expirado.'
          );
          // Poderia tentar fazer a chamada ao backend aqui diretamente para obter erro específico
          // e depois redirecionar para /auth/signin?error=...
          // Ex: router.push(`/auth/signin?error=${encodeURIComponent(result.error)}`);
        } else if (result?.ok && !result.error) {
          // Autenticação bem-sucedida, redireciona para a página inicial ou callbackUrl
          router.push(searchParams.get('callbackUrl') || '/');
        }
        setIsVerifying(false);
      };
      attemptSignIn();
    } else {
      setError('Parâmetros de e-mail ou código ausentes no link.');
      setIsVerifying(false);
    }
  }, [searchParams, router]);

  if (isVerifying) {
    return <p>Verificando seu link mágico...</p>;
  }

  if (error) {
    return (
      <div>
        <h1>Erro na Autenticação</h1>
        <p>{error}</p>
        <button onClick={() => router.push('/auth/signin')}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // Este estado não deve ser alcançado se o redirecionamento funcionar
  return <p>Redirecionando...</p>;
}
