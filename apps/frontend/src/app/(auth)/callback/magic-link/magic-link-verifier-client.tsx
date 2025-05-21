// src/app/auth/callback/magic-link/magic-link-verifier-client.tsx
'use client';

import { useState, useEffect, FormEvent, useRef } from 'react'; // Adicionado useRef
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface MagicLinkVerifierClientProps {
  initialEmail?: string | null;
  initialCode?: string | null;
  callbackUrl?: string | null;
}

export default function MagicLinkVerifierClient({
  initialEmail,
  initialCode,
  callbackUrl
}: MagicLinkVerifierClientProps) {
  const router = useRouter();
  const [formEmail, setFormEmail] = useState(initialEmail || '');
  const [formCode, setFormCode] = useState(initialCode || ''); // Pode ser preenchido se initialCode existir

  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const codeInputRef = useRef<HTMLInputElement>(null); // Ref para o campo de código

  const handleSignIn = async (emailToVerify: string, codeToVerify: string) => {
    if (!emailToVerify) {
      setError('O campo E-mail é obrigatório.');
      return;
    }
    if (!codeToVerify) {
      setError('O campo Código é obrigatório.');
      return;
    }
    if (codeToVerify.length !== 6) {
      // Exemplo de validação de tamanho
      setError('O código deve ter 6 dígitos.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setMessage(null);

    const result = await signIn('magic-link-verifier', {
      redirect: false,
      email: emailToVerify,
      code: codeToVerify
    });

    setIsVerifying(false);

    if (result?.error) {
      console.error('Sign in error:', result.error);
      setError(
        `Falha na autenticação (${result.error}). O link/código pode ser inválido, ter expirado ou o e-mail estar incorreto.`
      );
    } else if (result?.ok && !result.error) {
      setMessage('Autenticação bem-sucedida! Redirecionando...');
      setTimeout(() => {
        router.push(callbackUrl || '/');
      }, 1500);
    } else {
      setError('Ocorreu um erro inesperado durante a tentativa de login.');
    }
  };

  useEffect(() => {
    // Cenário 1: Login automático se AMBOS email e código estão presentes via URL
    if (initialEmail && initialCode) {
      setMessage('Verificando seu link mágico...');
      handleSignIn(initialEmail, initialCode);
    }
    // Cenário 2: Se APENAS initialEmail está presente (veio da URL, mas sem código),
    // preenche o campo de e-mail e foca no campo de código.
    else if (initialEmail && !initialCode) {
      setFormEmail(initialEmail); // Garante que o estado do formulário está atualizado
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }
    // Se nenhum parâmetro inicial relevante foi passado, o usuário preencherá manualmente.
    // O Server Component já deve ter redirecionado se AMBOS initialEmail e initialCode forem nulos.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail, initialCode]); // Não adicionar handleSignIn aqui para evitar loops

  const handleSubmitManual = (e: FormEvent) => {
    e.preventDefault();
    handleSignIn(formEmail, formCode);
  };

  // Se estiver tentando login automático (ambos initialEmail e initialCode presentes)
  if (isVerifying && initialEmail && initialCode) {
    return <p>{message || 'Verificando seu link mágico...'}</p>;
  }

  // Se o login automático foi bem sucedido e está apenas esperando o redirect
  if (message && !error && initialEmail && initialCode) {
    return <p style={{ color: 'green' }}>{message}</p>;
  }

  return (
    <div>
      {/* Mostra mensagem de sucesso ou erro apenas se não for o fluxo de login automático inicial */}
      {message && !(initialEmail && initialCode && isVerifying) && (
        <p style={{ color: 'green' }}>{message}</p>
      )}
      {error && (
        <p
          style={{
            color: 'red',
            border: '1px solid red',
            padding: '10px',
            marginTop: '10px'
          }}
        >
          {error}
        </p>
      )}

      {/* 
        O formulário é sempre renderizado, a menos que um login automático 
        (com initialEmail E initialCode) esteja em progresso ou tenha sido bem-sucedido.
        Se initialEmail existe, o campo é pré-preenchido.
      */}
      <form onSubmit={handleSubmitManual} style={{ marginTop: '20px' }}>
        <h2>
          {initialEmail && !initialCode
            ? 'Insira o Código Recebido'
            : 'Verificar Código Manualmente'}
        </h2>
        {initialEmail && !initialCode && (
          <p>
            Um código foi enviado para <strong>{initialEmail}</strong>. Por
            favor, insira-o abaixo.
          </p>
        )}
        {!initialEmail &&
          !initialCode && ( // Se nenhum param inicial, mostra mensagem genérica
            <p>
              Se o link não funcionou ou você prefere inserir o código
              manualmente:
            </p>
          )}

        <div>
          <label htmlFor='manual-email'>Seu E-mail:</label>
          <input
            type='email'
            id='manual-email'
            value={formEmail} // Usa o estado formEmail
            onChange={(e) => setFormEmail(e.target.value)}
            required
            disabled={isVerifying || !!initialEmail} // Desabilita se initialEmail veio da URL
            style={initialEmail ? { backgroundColor: '#f0f0f0' } : {}}
            aria-readonly={!!initialEmail}
          />
        </div>
        <div>
          <label htmlFor='manual-code'>Código Recebido:</label>
          <input
            ref={codeInputRef} // Adiciona a ref aqui
            type='text'
            id='manual-code'
            value={formCode} // Usa o estado formCode
            onChange={(e) => setFormCode(e.target.value)}
            required
            disabled={isVerifying}
            minLength={6}
            maxLength={6}
            autoComplete='one-time-code'
            inputMode='numeric'
            pattern='\d{6}'
            title='O código deve conter 6 números'
          />
        </div>
        <button
          type='submit'
          disabled={isVerifying}
          style={{ marginTop: '10px' }}
        >
          {isVerifying ? 'Verificando...' : 'Verificar Código'}
        </button>
      </form>

      {/* Botão de voltar para o login só se houver erro e não estiver no meio de uma verificação */}
      {error && !isVerifying && (
        <button
          onClick={() => router.push('/auth/signin')}
          style={{ marginTop: '1rem' }}
        >
          Solicitar Novo Link
        </button>
      )}
    </div>
  );
}
