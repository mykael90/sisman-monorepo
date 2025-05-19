// src/components/form-tanstack/form-success-display.tsx
'use client';

import { ReactNode } from 'react'; // Importação necessária para ReactNode
import { IActionResultForm } from '../../types/types-server-actions'; // Ajuste o caminho se necessário
import { Button } from '../ui/button'; // Ajuste o caminho se necessário

interface FormSuccessDisplayProps<TData extends object> {
  serverState: IActionResultForm<TData>;
  handleActions: {
    handleResetForm?: () => void; // Ação específica opcional
    [key: string]: (() => void) | undefined; // Permite outras ações dinâmicas
  };
  dataAddLabel: TData;
}

//TData>;

export function FormSuccessDisplay<TData extends object>({
  serverState,
  handleActions,
  dataAddLabel
}: FormSuccessDisplayProps<TData>) {
  const { createdData, message } = serverState;

  return (
    <div className='rounded-lg bg-white p-6 text-center shadow-md'>
      <h2 className={`text-sisman-green mb-4 text-xl font-semibold`}>
        {message || 'Operação realizada com sucesso!'}
      </h2>

      {createdData &&
        typeof createdData === 'object' &&
        dataAddLabel &&
        // TypeScript precisa de ajuda para saber que `key` é do tipo `keyof TData`
        // Object.keys retorna string[], então fazemos um type assertion.
        (Object.keys(createdData) as Array<keyof TData>).map((key) => {
          // `createdData` já foi verificado como objeto não nulo
          // `dataAddLabel` já foi verificado como objeto não nulo
          const value = createdData[key]; // Tipo: TData[keyof TData]
          const label = dataAddLabel[key]; // Tipo: ReactNode | undefined

          // Renderiza apenas se o label existir para esta chave e o valor não for undefined
          if (label !== undefined && value !== undefined) {
            return (
              <p
                key={String(key)} // Chaves de React devem ser strings ou números
                className='mb-2 text-sm text-gray-700'
              >
                {String(label)}: {String(value)}{' '}
                {/* Garante que o valor seja tratado como string para exibição */}
              </p>
            );
          }
          return null; // Retorna null se o label não deve ser exibido
        })}

      {/* } */}

      {handleActions.handleResetForm && ( //adicionar botão se a ação estiver definida
        <Button onClick={handleActions.handleResetForm} className='mt-4'>
          Adicionar Outro
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
