'use client';

import { useRouter } from 'next/navigation';
import { Mail, XCircle, Home, RefreshCw } from 'lucide-react';
import { AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const errorTitle = 'Erro Inesperado';
  const userFriendlyMessage = `Ocorreu um erro inesperado na aplicação. Nossa equipe já foi notificada e está trabalhando para resolver o problema.`;
  const technicalDetailsLabel = 'Detalhes do Erro';
  const tryAgainLabel = 'Tentar novamente';
  const goHomeLabel = 'Ir para o Início';

  return (
    <div className='flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <Card className='w-full max-w-md rounded-lg shadow-md'>
        <CardContent className='flex flex-col items-center justify-center p-8 text-center'>
          <XCircle className='mb-4 h-12 w-12 text-red-500' />
          <AlertTitle className='mb-2 text-2xl font-bold text-gray-800 dark:text-gray-200'>
            {errorTitle}
          </AlertTitle>
          <AlertDescription className='mb-6 text-gray-600 dark:text-gray-400'>
            <p>{userFriendlyMessage}</p>
          </AlertDescription>

          {(error?.message || error?.digest) && (
            <details className='mt-4 w-full text-left text-sm'>
              <summary className='cursor-pointer font-medium text-gray-700 hover:underline dark:text-gray-300'>
                {technicalDetailsLabel}
              </summary>
              <pre className='mt-2 rounded-md bg-gray-50 p-3 text-xs break-all whitespace-pre-wrap text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
                {error.message && `Mensagem: ${error.message}`}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          <div className='flex flex-col gap-4 pt-6 sm:flex-row'>
            <Button
              onClick={() => router.push('/')}
              className='w-full sm:w-auto'
            >
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
          </div>
          <p className='pt-4 text-sm text-gray-500 dark:text-gray-400'>
            <Mail className='mr-1 inline h-4 w-4' /> Erro reportado à equipe
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
