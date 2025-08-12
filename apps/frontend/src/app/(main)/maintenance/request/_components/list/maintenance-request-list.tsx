'use client';

import { useMemo, useState } from 'react';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Plus, Wrench } from 'lucide-react';

import { IMaintenanceRequestWithRelations } from '../../request-types';
import { columns } from './maintenance-request-columns';
import { MaintenanceRequestFilters } from './maintenance-request-filters';
import { SectionListHeader } from '@/components/section-list-header';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';

interface MaintenanceRequestListProps {
  initialData: IMaintenanceRequestWithRelations[];
  refreshAction: () => void;
}

export function MaintenanceRequestList({
  initialData,
  refreshAction
}: MaintenanceRequestListProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  // State for filters
  const [requestValue, setRequestValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'createdAt',
      desc: true
    }
  ]);

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (requestValue) {
      filters.push({ id: 'solicitation', value: requestValue });
    }
    if (statusFilter) {
      filters.push({ id: 'status', value: statusFilter });
    }
    return filters;
  }, [requestValue, statusFilter]);

  const handleClearFilters = () => {
    setRequestValue('');
    setStatusFilter('');
  };

  const handleAddRequest = () => {
    router.push('/maintenance-request/add');
  };

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Requisições'
        subtitle='Sistema de gerenciamento de requisições de manutenção'
        TitleIcon={Wrench}
        actionButton={{
          text: 'Cadastrar Requisição',
          onClick: handleAddRequest,
          variant: 'default',
          Icon: Plus
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <MaintenanceRequestFilters
          requestValue={requestValue}
          setRequestValue={setRequestValue}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      <TableTanstack
        data={data}
        columns={columns}
        columnFilters={columnFilters}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
}
