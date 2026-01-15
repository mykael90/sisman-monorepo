import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMaintenanceRequestShowWithRelations } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

interface MaintenanceRequestTimelineProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestTimeline({
  data
}: MaintenanceRequestTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Linha do Tempo</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 pt-6'>
        {data?.timelineEvents && data.timelineEvents.length > 0 ? (
          <div className='relative pl-8'>
            {/* Linha vertical */}
            <div className='absolute top-0 left-2 h-full w-0.5 bg-gray-300'></div>
            {data.timelineEvents.map((event, index) => (
              <div key={index} className='relative mb-6'>
                {/* Círculo do evento */}
                <div className='bg-primary absolute top-0 -left-[10px] h-4 w-4 rounded-full ring-4 ring-white dark:ring-gray-900'></div>
                <p className='font-semibold'>{event.description}</p>
                <p className='text-muted-foreground text-sm'>
                  {format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground'>
            Nenhum evento na linha do tempo encontrado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
