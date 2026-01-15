import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMaintenanceRequestShowWithRelations } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { Label } from '@/components/ui/label';

interface MaintenanceRequestStatsProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestStats({
  data
}: MaintenanceRequestStatsProps) {
  const totalMaterialRequests = data?.materialRequests?.length || 0;
  const totalServiceOrders = data?.serviceOrders?.length || 0;
  const totalContractOrders = data?.maintenanceContractOrders?.length || 0;
  const totalTimelineEvents = data?.timelineEvents?.length || 0;
  const totalStatuses = data?.statuses?.length || 0;
  const totalRequestedMaterialValue =
    data?.materialRequests?.reduce(
      (sum, req) => sum + Number(req.requestValue || 0),
      0
    ) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Estatísticas Gerais</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 pt-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <div className='space-y-1'>
            <Label>Requisições de Materiais</Label>
            <p className='text-muted-foreground font-semibold'>
              {totalMaterialRequests}
            </p>
          </div>
          <div className='space-y-1'>
            <Label>Valor Total de Materiais Requisitados</Label>
            <p className='text-muted-foreground font-semibold'>
              {totalRequestedMaterialValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>
          <div className='space-y-1'>
            <Label>Ordens de Serviço</Label>
            <p className='text-muted-foreground font-semibold'>
              {totalServiceOrders}
            </p>
          </div>
          <div className='space-y-1'>
            <Label>Ordens de Contrato</Label>
            <p className='text-muted-foreground font-semibold'>
              {totalContractOrders}
            </p>
          </div>
          <div className='space-y-1'>
            <Label>Eventos na Linha do Tempo</Label>
            <p className='text-muted-foreground font-semibold'>
              {totalTimelineEvents}
            </p>
          </div>
          <div className='space-y-1'>
            <Label>Histórico de Status</Label>
            <p className='text-muted-foreground font-semibold'>
              {totalStatuses}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
