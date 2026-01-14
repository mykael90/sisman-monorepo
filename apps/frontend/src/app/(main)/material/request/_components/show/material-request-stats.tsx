import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Truck, Package } from 'lucide-react';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';

interface Props {
  requestData: IMaterialRequestShowWithRelations;
}

export function MaterialRequestStats({ requestData }: Props) {
  const totalItems = requestData.items?.length || 0;

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
      <StatCard
        label='Ordens de Reserva'
        value={requestData.materialPickingOrders?.length || 0}
        icon={<ClipboardList className='text-primary h-8 w-8' />}
      />

      <StatCard
        label='Entradas'
        value={requestData.materialReceipts?.length || 0}
        icon={<Truck className='h-8 w-8 text-green-500' />}
      />

      <StatCard
        label='Saídas'
        value={requestData.materialWithdrawals?.length || 0}
        icon={<Truck className='h-8 w-8 -scale-x-100 text-red-500' />}
      />

      <StatCard
        label='Itens na Requisição'
        value={totalItems}
        icon={<Package className='h-8 w-8 text-blue-500' />}
      />
    </div>
  );
}

// Sub-componente interno simples para evitar repetição
function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-muted-foreground text-sm font-medium'>{label}</p>
            <p className='text-2xl font-bold'>{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
