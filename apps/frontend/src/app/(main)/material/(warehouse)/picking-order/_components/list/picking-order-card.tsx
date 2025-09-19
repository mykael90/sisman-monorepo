import { IPickingOrderWithRelations } from '../../picking-order-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PickingOrderCardProps {
  pickingOrder: IPickingOrderWithRelations;
}

export function PickingOrderCard({ pickingOrder }: PickingOrderCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`picking-order/${pickingOrder.id}`);
  };

  return (
    <Card className='flex flex-col'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>
          Ordem de Reserva #{pickingOrder.id}
        </CardTitle>
        <Package className='text-muted-foreground h-4 w-4' />
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className='text-2xl font-bold'>{pickingOrder.status}</div>
        <p className='text-muted-foreground text-xs'>
          Criado em: {new Date(pickingOrder.createdAt).toLocaleDateString()}
        </p>
        {pickingOrder.maintenanceRequest && (
          <p className='text-muted-foreground text-xs'>
            Requisição de Manutenção: {pickingOrder.maintenanceRequest.title}
          </p>
        )}
        <Button
          variant='outline'
          className='mt-4 w-full'
          onClick={handleViewDetails}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
