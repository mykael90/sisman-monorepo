// src/components/form-tanstack/form-success-display.tsx
'use client';

import { ReactNode } from 'react'; // Importação necessária para ReactNode
import { IActionResultForm } from '../../types/types-server-actions'; // Ajuste o caminho se necessário
import { Button } from '../ui/button'; // Ajuste o caminho se necessário

interface FormSuccessDisplayProps<TSubmittedData, TApiResponse> {
  serverState: IActionResultForm<TSubmittedData, TApiResponse>;
  handleActions: {
    handleResetForm?: () => void; // Ação específica opcional
    [key: string]: (() => void) | undefined; // Permite outras ações dinâmicas
  };
  dataAddLabel?: { [k: string]: string };
  messageActions?: {
    handleResetForm?: string;
  };
}

//TData>;

export function FormSuccessDisplay<TSubmittedData, TApiResponse>({
  serverState,
  handleActions,
  dataAddLabel,
  messageActions
}: FormSuccessDisplayProps<TSubmittedData, TApiResponse>) {
  const { responseData, message } = serverState;

  return (
    <div className='rounded-lg bg-white p-6 text-center shadow-md'>
      <h2 className={`text-sisman-green mb-4 text-xl font-semibold`}>
        {message || 'Operação realizada com sucesso!'}
      </h2>

      {/* Example of how you might display responseData if needed */}
      {serverState.responseData &&
        dataAddLabel &&
        Object.keys(serverState.responseData).length > 0 && (
          <div className='mt-4 text-left text-sm'>
            <p className='font-medium'>Detalhes:</p>
            <ul className='list-inside list-disc'>
              {Object.entries(serverState.responseData)
                .filter(([key]) => dataAddLabel[key]) // Only show if label exists
                .map(([key, value]) => (
                  <li key={key}>
                    <strong>{dataAddLabel[key]}:</strong> {String(value)}
                  </li>
                ))}
            </ul>
          </div>
        )}

      {handleActions.handleResetForm && ( //adicionar botão se a ação estiver definida
        <Button onClick={handleActions.handleResetForm} className='mt-4'>
          {messageActions?.handleResetForm || ''}
        </Button>
      )}
      {/* Você pode adicionar um botão para "Tentar Novamente" em caso de erro, se desejar */}
      {/* {!success &&
        handleActions.handleResetForm && ( // Exemplo: um botão de reset/retry em caso de erro
          <Button onClick={handleActions.handleResetForm} className='mt-4'>
            Tentar Novamente
          </Button>
        )} */}
    </div>
  );
}
