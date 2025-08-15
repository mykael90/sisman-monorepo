'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming this path is correct for your project

// Parent component that now does NOT use useSearchParams directly
export default function ErrorTestPage() {
  // Estado para armazenar um erro que deve ser lançado na renderização
  const [errorToThrow, setErrorToThrow] = useState<Error | null>(null);

  const handleClientError = () => {
    // To make error.tsx catch this, we set it to state,
    // which causes a re-render, and then the error is thrown
    // during the render phase.
    // O erro só é capturado ao tentar renderizar, por isso apenas lançar um erro com
    // new Error... (sem está dentro de setErrorToThrow não invoca o error.tsx)
    setErrorToThrow(
      new Error('Client-side error triggered from event handler.')
    );
  };

  const handleSimulatedServerError = async () => {
    // Simula uma chamada de API que falha.
    // Para que o error.tsx capture, precisamos pegar o erro assíncrono
    // e então causar um erro que a boundary possa pegar (lançando na renderização).
    try {
      // Use a sua rota de API que deve retornar um erro para este teste.
      // Exemplo: /api/error (certifique-se que ela retorne um status de erro como 500)
      const response = await fetch('/api/error', { method: 'POST' });
      if (!response.ok) {
        // Cria um erro com base na resposta da API
        throw new Error(
          `Simulated server error: API responded with ${response.status}`
        );
      }
      // Se, por algum motivo, a API não retornar um erro neste teste:
      // throw new Error('Simulated server error: API call succeeded but was expected to fail for this test.');
    } catch (e) {
      // Define o erro no estado. Isso causará uma nova renderização.
      setErrorToThrow(e as Error);
    }
  };

  // Se errorToThrow estiver definido (após o catch no handleSimulatedServerError),
  // lança o erro durante esta fase de renderização.
  // Isso será capturado pelo error.tsx.
  if (errorToThrow) {
    throw errorToThrow;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* ErrorTestPageContent is wrapped in Suspense.
          It will now call useSearchParams internally. */}
      <ErrorTestPageContent
        // searchParams prop is removed
        handleClientError={handleClientError}
        handleSimulatedServerError={handleSimulatedServerError}
      />
    </Suspense>
  );
}

// Child component that now uses useSearchParams and is correctly wrapped in Suspense
function ErrorTestPageContent({
  // searchParams prop is removed from here
  handleClientError,
  handleSimulatedServerError
}: {
  // searchParams: ReturnType<typeof useSearchParams>; // Prop type definition removed
  handleClientError: () => void;
  handleSimulatedServerError: () => Promise<void>;
}) {
  // useSearchParams is now called here, inside the component wrapped by Suspense
  const searchParams = useSearchParams();
  const errorType = searchParams.get('type');

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='mb-4 text-2xl font-bold'>Test Errors</h1>
      <div className='flex space-x-4'>
        <Button color='danger' onClick={handleClientError}>
          Throw Client Error
        </Button>
        <Button color='danger' onClick={handleSimulatedServerError}>
          Simulate Server/API Error (to be caught by boundary)
        </Button>
      </div>
      {errorType && (
        <p className='mt-4 text-red-500'>
          Error Type: {errorType === 'client' ? 'Client' : 'Server'}
        </p>
      )}
    </div>
  );
}
