// components/MagicLinkVerifierClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Importe de 'next/navigation' para App Router

interface MagicLinkVerifierClientProps {
  email: string;
  code: string;
  callbackUrl: string;
}

export default function MagicLinkVerifierClient({
  email,
  code,
  callbackUrl
}: MagicLinkVerifierClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(
    'Verificando seu link mágico...'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const attemptSignIn = async () => {
      try {
        // Chama a função signIn com o provider 'magic-link-verifier'
        // `redirect: false` permite que manipulemos o resultado aqui, incluindo erros.
        const result = await signIn('magic-link-verifier', {
          email,
          code,
          callbackUrl, // Passa o callbackUrl para o NextAuth
          redirect: false // Importante para capturar o resultado e tratar erros manualmente
        });

        if (result?.ok) {
          // Se o signIn for bem-sucedido, NextAuth já deve ter configurado a sessão.
          // Redirecionamos para a callbackUrl fornecida por NextAuth (result.url)
          // ou para a callbackUrl original, ou para a raiz como fallback.
          setStatus('Autenticação bem-sucedida! Redirecionando...');
          router.push(result.url || callbackUrl || '/');
        } else {
          // Se result.ok for false, houve um erro.
          // O NextAuth pode retornar um código de erro em result.error.
          // Precisamos que o provider 'magic-link-verifier', em caso de código expirado,
          // retorne um erro que possamos identificar, ou assumimos que qualquer erro
          // do 'magic-link-verifier' aqui significa que o link expirou, conforme o requisito.

          // Para o requisito específico: "Se o código de validação estiver expirado,
          // redirecione o usuário para a raiz /, com o searchparam = error=MagicLinkExpired"
          // Assumimos que qualquer falha no 'magic-link-verifier' aqui se encaixa nisso.
          // Idealmente, seu provider 'magic-link-verifier' retornaria um `error` específico
          // como "MagicLinkExpired" em `result.error`.
          // Ex: if (result?.error === 'SpecificErrorForExpiredLink') { ... }

          console.error(
            'Falha no signIn com magic-link-verifier:',
            result?.error
          );
          setStatus('Falha na verificação do link mágico.');
          // Redireciona para a raiz com o erro de link expirado
          router.push(
            `/signin?error=MagicLinkExpired&callbackUrl=${callbackUrl}`
          );
        }
      } catch (e: any) {
        console.error('Erro inesperado durante o signIn:', e);
        setStatus('Ocorreu um erro inesperado.');
        setError(e.message || 'Erro desconhecido');
        // Para erros inesperados, podemos redirecionar com um erro genérico
        router.push(
          `/signin?error=UnexpectedSignInErrorMagicLink&callbackUrl=${callbackUrl}`
        );
      }
    };

    // Garante que temos email e code antes de tentar o signIn
    if (email && code) {
      attemptSignIn();
    } else {
      // Este caso deve ser pego pelo Server Component, mas como fallback:
      setStatus('Parâmetros inválidos.');
      router.push(
        `/signin?error=InvalidMagicLinkParams&callbackUrl=${callbackUrl}`
      );
    }

    // O array de dependências do useEffect.
    // router é estável, mas é boa prática incluí-lo se usado dentro do effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, code, callbackUrl, router]);

  // UI de carregamento/status
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      {/* Pode adicionar um spinner SVG ou componente aqui */}
      <div style={{ marginBottom: '20px' }}>
        <svg
          style={{
            animation: 'spin 1s linear infinite',
            width: '50px',
            height: '50px'
          }}
          viewBox='0 0 24 24'
        >
          <circle
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
            fill='none'
            strokeDasharray='31.415, 31.415'
            strokeDashoffset='15.7075'
          >
            <animateTransform
              attributeName='transform'
              type='rotate'
              from='0 12 12'
              to='360 12 12'
              dur='1s'
              repeatCount='indefinite'
            />
          </circle>
        </svg>
      </div>
      <h1 style={{ fontSize: '1.5em', marginBottom: '10px' }}>{status}</h1>
      {error && <p style={{ color: 'red' }}>Detalhes: {error}</p>}
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
