'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  materialOriginDisplayMap,
  materialRequestTypeDisplayMap,
  statusMaterialRequestDisplayMap
} from '@/mappers/material-request-mappers-translate';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';
import { useRouter } from 'next/navigation';

export function MaterialRequestHeader({
  data
}: {
  data: IMaterialRequestShowWithRelations;
}) {
  const router = useRouter();

  return (
    <div className='mt-4 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
      <div className='flex items-center'>
        <div className='mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-lg'>
          <ClipboardList className='h-8 w-8' />
        </div>
        <div>
          <h1 className='text-primary text-xl font-bold'>
            Requisição de Material: {data.protocolNumber}
          </h1>
          <p className='text-sm text-muted-foreground'>
            ID: {data.id} | Criada em: {formatDate(data.createdAt)}
          </p>
          <div className='mt-2 flex flex-wrap gap-2'>
            <Badge variant='secondary'>
              Status:{' '}
              {statusMaterialRequestDisplayMap[data.currentStatus] ||
                data.currentStatus}
            </Badge>
            <Badge variant='outline'>
              Tipo:{' '}
              {materialRequestTypeDisplayMap[data.requestType] ||
                data.requestType}
            </Badge>
            <Badge variant='outline'>
              Origem: {materialOriginDisplayMap[data.origin] || data.origin}
            </Badge>
          </div>
        </div>
      </div>
      <div className='flex w-full justify-end sm:w-auto'>
        <Button
          variant={'outline'}
          onClick={() => router.push('/material/request')}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar para a listagem
        </Button>
      </div>
    </div>
  );
}
