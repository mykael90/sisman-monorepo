// src/app/(auth)/callback/magic-link/page.tsx
// Este é um Server Component por padrão no App Router

import MagicLinkVerifierClient from './magic-link-verifier-client';

// Adicione esta linha para forçar a renderização dinâmica da rota.

type SearchParams = Promise<{
  // searchParams é sempre fornecido, mesmo que vazio. Torná-lo não opcional é mais preciso.
  email?: string;
  code?: string;
  callbackUrl?: string;
  error?: string; // Para erros passados pelo NextAuth via URL
}>;

export default async function MagicLinkCallbackPage(props: {
  searchParams: SearchParams;
}) {
  // Acessando diretamente as propriedades do objeto searchParams.
  const searchParams = await props.searchParams;
  const initialEmail = searchParams.email;
  const initialCode = searchParams.code;
  const callbackUrl = searchParams.callbackUrl;
  const nextAuthError = searchParams.error;

  return (
    <div>
      <h1>Verificação de Link Mágico</h1>
      {nextAuthError && (
        <p
          style={{
            color: 'darkred',
            backgroundColor: '#ffebee',
            border: '1px solid darkred',
            padding: '10px',
            borderRadius: '4px'
          }}
        >
          <b>Erro na autenticação:</b> {decodeURIComponent(nextAuthError)}. Por
          favor, tente solicitar um novo link ou verifique o código inserido.
        </p>
      )}
      <MagicLinkVerifierClient
        initialEmail={initialEmail}
        initialCode={initialCode}
        callbackUrl={callbackUrl}
      />
    </div>
  );
}

export const metadata = {
  title: 'Verificar Link Mágico'
};
