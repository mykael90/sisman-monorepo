import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMaintenanceRequestShowWithRelations } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { format } from 'date-fns';

interface MaintenanceRequestStatusHistoryProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestStatusHistory({
  data
}: MaintenanceRequestStatusHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Histórico de Status</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 pt-6'>
        {data?.statuses && data.statuses.length > 0 ? (
          data.statuses.map((status, index) => (
            <div
              key={index}
              className='border-primary-foreground border-l-4 pl-4'
            >
              <p className='font-semibold'>Status: {status.status}</p>
              <p className='text-muted-foreground text-sm'>
                {status.description}
              </p>
              <p className='text-muted-foreground text-xs'>
                Data: {format(new Date(status.createdAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          ))
        ) : (
          <p className='text-muted-foreground'>
            Nenhum histórico de status encontrado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
