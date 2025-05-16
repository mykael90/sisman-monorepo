// src/components/form-tanstack/form-success-display.tsx
'use client';

import { IActionResultForm } from '../../types/types-server-actions';
import { Button } from '../ui/button';

interface FormSuccessDisplayProps<TData> {
  serverState: IActionResultForm<TData>;
  handleActions: {
    [key: string]: () => void;
  };
}

export function FormSuccessDisplay<TData = any>({
  serverState,
  handleActions // ações que podem ter nesses botões
}: FormSuccessDisplayProps<TData>) {
  return (
    <div className='rounded-lg bg-white p-6 text-center shadow-md'>
      <h2 className='mb-4 text-xl font-semibold text-green-600'>
        {serverState.message || 'Operação realizada com sucesso!'}
      </h2>
      {serverState.createdData &&
        'name' in serverState.createdData &&
        serverState.createdData.name !== undefined && (
          <p className='mb-4 text-sm text-gray-700'>
            Usuário: {serverState.createdData.name}
            {/* Se você tiver um ID e quiser exibi-lo, pode adicionar aqui */}
            {/* Ex: submittedData.id ? ` (ID: ${serverState.submittedData.id})` : '' */}
          </p>
        )}
      <Button onClick={handleActions.handleResetForm}>Adicionar Outro</Button>
    </div>
  );
}
