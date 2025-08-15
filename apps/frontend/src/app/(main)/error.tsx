'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, MessageSquare, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const errorTitle = 'Ops! Um Erro Ocorreu';
  const userFriendlyMessage =
    'Não foi possível concluir a ação solicitada. Você pode tentar novamente ou voltar para a página inicial.';
  const technicalDetailsLabel = 'Detalhes técnicos';
  const goHomeLabel = 'Ir para o início';
  const tryAgainLabel = 'Tentar Novamente';
  const contactSupportLabel = 'Suporte';

  return (
    <div className='flex flex-grow flex-col items-center justify-center gap-y-8 p-10 text-center'>
      <Alert className='w-full max-w-lg bg-gray-50 text-left'>
        <AlertTriangle className='h-5 w-5' />
        <AlertTitle className='text-xl font-semibold'>{errorTitle}</AlertTitle>
        <AlertDescription className='mt-2'>
          {' '}
          {/* Removido break-words daqui, pois o controle fino será no <pre> */}
          <p>{userFriendlyMessage}</p>
          {(error?.message || error?.digest) && (
            <details className='mt-4 flex w-full max-w-lg flex-col gap-2 text-sm'>
              <summary className='cursor-pointer font-medium hover:underline'>
                {technicalDetailsLabel}
              </summary>
              {/* 
                - whitespace-pre-wrap: Preserva espaços e quebras de linha, mas permite wrapping.
                - break-all: Força a quebra de strings longas e contínuas para evitar overflow.
              */}
              <pre className='bg-muted text-muted-foreground mt-2 rounded-md p-3 text-xs break-all whitespace-pre-wrap'>
                {error.message && `Mensagem: ${error.message}`}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>

      <div className='flex flex-col gap-4 sm:flex-row'>
        <Button onClick={() => router.push('/')} className='w-full sm:w-auto'>
          <Home className='mr-2 h-4 w-4' />
          {goHomeLabel}
        </Button>
        <Button
          onClick={() => reset()}
          variant='outline'
          className='w-full sm:w-auto'
        >
          <RefreshCw className='mr-2 h-4 w-4' />
          {tryAgainLabel}
        </Button>
        <Button
          onClick={() => console.log('Falar com Suporte clicado')} // Lógica a ser implementada
          variant='outline'
          className='w-full sm:w-auto'
        >
          <MessageSquare className='mr-2 h-4 w-4' />
          {contactSupportLabel}
        </Button>
      </div>
    </div>
  );
}
