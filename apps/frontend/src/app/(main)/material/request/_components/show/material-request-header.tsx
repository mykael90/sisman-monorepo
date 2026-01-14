// components/material-request-header.tsx
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  materialOriginDisplayMap,
  materialRequestTypeDisplayMap,
  statusMaterialRequestDisplayMap
} from '@/mappers/material-request-mappers-translate';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';

export function MaterialRequestHeader({
  data
}: {
  data: IMaterialRequestShowWithRelations;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2 text-2xl'>
            <ClipboardList className='h-6 w-6' />
            Requisição de Material: {data.protocolNumber}
          </CardTitle>
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
        <div className='text-right'>
          <p className='text-muted-foreground text-sm'>ID: {data.id}</p>
          <p className='text-muted-foreground text-sm'>
            Criada em: {formatDate(data.createdAt)}
          </p>
        </div>
      </CardHeader>
      {/* O CardContent com Grid de Info deve ir para o componente GeneralInfo */}
    </Card>
  );
}
