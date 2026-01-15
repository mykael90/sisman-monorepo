'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MaintenanceRequestHeader() {
  const router = useRouter();

  return (
    <div className='mt-4 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
      <div className='flex items-center'>
        <div className='mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-lg'>
          <ClipboardList className='h-8 w-8' />
        </div>
        <div>
          <h1 className='text-primary text-xl font-bold'>
            Detalhes da Requisição de Manutenção
          </h1>
          <p className='text-muted-foreground text-sm'>
            Informações sobre status, movimentações de materiais, requisições de
            materiais vinculadas, ordens de serviço, instâncias associadas,
            diagnósticos, entre outros, relativa à requisição de manutenção
            específica.
          </p>
        </div>
      </div>
      <div className='flex w-full justify-end sm:w-auto'>
        <Button
          variant={'outline'}
          onClick={() => router.push('/maitenance/request')}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar para a listagem
        </Button>
      </div>
    </div>
  );
}
