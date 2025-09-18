// src/components/form-tanstack/form-success-display-card.tsx
'use client';

import { ReactNode } from 'react';
import { IActionResultForm } from '@/types/types-server-actions';
import { Button } from '../ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FormSuccessDisplayCardProps<TSubmittedData, TApiResponse> {
  serverState: IActionResultForm<TSubmittedData, TApiResponse>;
  handleActions?: {
    handleResetForm?: () => void;
    [key: string]: (() => void) | undefined;
  };
  dataAddLabel?: { [k: string]: string };
  messageActions?: {
    handleResetForm?: string;
    [key: string]: string | undefined;
  };
  isInDialog?: boolean;
}

export function FormSuccessDisplayCard<TSubmittedData, TApiResponse>({
  serverState,
  handleActions,
  dataAddLabel,
  messageActions,
  isInDialog = false
}: FormSuccessDisplayCardProps<TSubmittedData, TApiResponse>) {
  const { responseData, message } = serverState;

  return (
    <Card className='border-sisman-green bg-sisman-green/10 text-sisman-green'>
      <CardHeader>
        <CardTitle className='text-center'>
          {message || 'Operação realizada com sucesso!'}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-1 text-sm'>
        {serverState.responseData &&
          dataAddLabel &&
          Object.keys(serverState.responseData).length > 0 && (
            <div className='mt-4 text-left text-sm'>
              <p className='font-medium'>Detalhes:</p>
              <ul className='list-inside list-disc'>
                {Object.entries(serverState.responseData)
                  .filter(([key]) => dataAddLabel[key])
                  .map(([key, value]) => (
                    <li key={key}>
                      <strong>{dataAddLabel[key]}:</strong> {String(value)}
                    </li>
                  ))}
              </ul>
            </div>
          )}

        <div className='mt-4 flex justify-center gap-4'>
          {handleActions && handleActions.handleResetForm && (
            <Button
              onClick={() => {
                console.log('aqui 1');
                if (handleActions.handleResetForm) {
                  handleActions.handleResetForm();
                }
              }}
              className='flex'
            >
              {messageActions?.handleResetForm || ''}
            </Button>
          )}
          {isInDialog ? (
            <DialogClose asChild>
              <Button className='flex'>Voltar para lista</Button>
            </DialogClose>
          ) : (
            handleActions &&
            handleActions.handleCancelForm && (
              <Button onClick={handleActions.handleCancelForm} className='flex'>
                Voltar para lista
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
