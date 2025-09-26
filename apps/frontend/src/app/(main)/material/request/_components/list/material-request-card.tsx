import { IMaterialRequestWithRelations } from '../../material-request-types'; // Alterado
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface MaterialRequestCardProps {
  // Alterado
  materialRequest: IMaterialRequestWithRelations; // Alterado
}

export function MaterialRequestCard({
  materialRequest
}: MaterialRequestCardProps) {
  // Alterado
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`request/${materialRequest.id}`); // Alterado
  };

  return (
    <Card className='flex flex-col'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>
          Requisição de Material #{materialRequest.id} {/* Alterado */}
        </CardTitle>
        <Package className='text-muted-foreground h-4 w-4' />
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className='text-2xl font-bold'>
          {materialRequest.currentStatus}
        </div>{' '}
        {/* Alterado */}
        <p className='text-muted-foreground text-xs'>
          Criado em: {new Date(materialRequest.createdAt).toLocaleDateString()}{' '}
          {/* Alterado */}
        </p>
        {materialRequest.maintenanceRequest && (
          <p className='text-muted-foreground text-xs'>
            Requisição de Manutenção:{' '}
            {materialRequest.maintenanceRequest.protocolNumber} {/* Alterado */}
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
