'use client';

import { DataTable } from '@/components/table-tanstack/data-table';
import { columns } from './maintenance-instance-columns';
import { MaintenanceInstanceList } from '../../maintenance-instance-types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  initialInstances: MaintenanceInstanceList[];
  refreshAction: () => Promise<boolean>;
}

export function MaintenanceInstanceListPage({
  initialInstances,
  refreshAction
}: Props) {
  const router = useRouter();

  const handleRefresh = async () => {
    await refreshAction();
    router.refresh();
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>Instâncias de Manutenção</h2>
        <div className='flex gap-2'>
          <Button onClick={handleRefresh} variant='outline'>
            Atualizar
          </Button>
          <Button
            onClick={() => router.push(`${window.location.pathname}/add`)}
          >
            <Plus className='mr-2 h-4 w-4' />
            Nova Instância
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={initialInstances}
        entityType='maintenance-instances'
        filterColumn='name'
      />
    </div>
  );
}
