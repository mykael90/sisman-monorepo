'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataTable } from '@/components/table-tanstack/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WarehouseFilters } from './warehouse-filters';
import { warehouseColumns } from './warehouse-columns';
import { IWarehouseList } from '../../warehouse-types';

interface WarehouseListPageProps {
  initialWarehouses: IWarehouseList[];
  refreshAction: () => Promise<void>;
}

export function WarehouseListPage({
  initialWarehouses,
  refreshAction
}: WarehouseListPageProps) {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const table = useReactTable({
    data: warehouses,
    columns: warehouseColumns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAction();
    setIsRefreshing(false);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Depósitos</h2>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button onClick={() => router.push('/warehouse/add')}>
            <Plus className='mr-2 h-4 w-4' />
            Novo Depósito
          </Button>
        </div>
      </div>

      <div className='rounded-md border bg-white p-4'>
        <WarehouseFilters table={table} />
        <DataTable
          columns={warehouseColumns}
          data={warehouses}
          entityType='warehouse'
        />
      </div>
    </div>
  );
}
