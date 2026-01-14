import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { statusMaterialRequestDisplayMap } from '@/mappers/material-request-mappers-translate';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';

interface Props {
  history: IMaterialRequestShowWithRelations['statusHistory'];
}

export function MaterialRequestHistory({ history }: Props) {
  if (!history || history.length === 0) return null;

  // Ordenar para garantir exibição correta (caso não venha ordenado do banco)
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <History className='h-5 w-5' />
          Histórico de Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {sortedHistory.map((item, index) => (
            <div key={index} className='flex items-start gap-4'>
              {/* Linha do tempo visual */}
              <div className='flex flex-col items-center'>
                <div
                  className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`}
                />
                {index < sortedHistory.length - 1 && (
                  <div className='h-8 w-0.5 bg-gray-200' />
                )}
              </div>

              {/* Conteúdo do Histórico */}
              <div className='flex-1'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>
                      {statusMaterialRequestDisplayMap[item.status] ||
                        item.status}
                    </Badge>
                    {item.changedById && (
                      <span className='text-muted-foreground text-sm'>
                        por Usuário {item.changedById}
                      </span>
                    )}
                  </div>
                  <p className='text-muted-foreground text-sm'>
                    {formatDate(item.changeDate)}
                  </p>
                </div>
                {item.notes && (
                  <p className='text-muted-foreground mt-2 text-sm'>
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
