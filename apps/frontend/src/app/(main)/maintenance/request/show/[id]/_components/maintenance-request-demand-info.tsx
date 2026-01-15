import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { IMaintenanceRequestShowWithRelations } from '@/app/(main)/maintenance/request/maintenance-request-types';

interface MaintenanceRequestDemandInfoProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestDemandInfo({
  data
}: MaintenanceRequestDemandInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Informações da Demanda</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Descrição da Ocorrência</Label>
            <p className='text-muted-foreground'>
              {data?.diagnosis?.occurrence?.description ?? 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Título da Ocorrência</Label>
            <p className='text-muted-foreground'>
              {data?.diagnosis?.occurrence?.title ?? 'Não informada'}
            </p>
          </div>
        </div>
        {/* Adicionar outros campos de demanda se houver */}
      </CardContent>
    </Card>
  );
}
