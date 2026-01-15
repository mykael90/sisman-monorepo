import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMaintenanceRequestShowWithRelations } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { Label } from '@/components/ui/label';

interface MaintenanceRequestServiceFlowProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestServiceFlow({
  data
}: MaintenanceRequestServiceFlowProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Fluxo do Serviço</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        {/* Seção de Ordens de Serviço */}
        <div>
          <Label className='text-md font-semibold'>Ordens de Serviço</Label>
          {data?.serviceOrders && data.serviceOrders.length > 0 ? (
            <div className='mt-2 space-y-2'>
              {data.serviceOrders.map((order, index) => (
                <div key={index} className='border-l-4 border-gray-200 pl-4'>
                  <p className='font-medium'>OS #{order.id}</p>
                  {/* Adicionar mais detalhes da ordem de serviço aqui */}
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground mt-2'>
              Nenhuma ordem de serviço associada.
            </p>
          )}
        </div>

        {/* Seção de Ordens de Contrato */}
        <div>
          <Label className='text-md font-semibold'>Ordens de Contrato</Label>
          {data?.maintenanceContractOrders &&
          data.maintenanceContractOrders.length > 0 ? (
            <div className='mt-2 space-y-2'>
              {data.maintenanceContractOrders.map((contractOrder, index) => (
                <div key={index} className='border-l-4 border-gray-200 pl-4'>
                  <p className='font-medium'>Contrato #{contractOrder.id}</p>
                  {/* Adicionar mais detalhes da ordem de contrato aqui */}
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground mt-2'>
              Nenhuma ordem de contrato associada.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
