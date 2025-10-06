
'use client';

import {
  useState,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction
} from 'react';
import { SectionListHeader } from '../../../../../components/section-list-header';
import {
  ColumnDef,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { IWorkerManualFrequencyWithRelations } from '../../worker-manual-frequency-types';
import { useRouter } from 'next/navigation';
import {
  columns,
  createActions,
} from './worker-manual-frequency-columns';
import { UserPlus, CalendarPlus } from 'lucide-react';
import { TableTanstackFaceted } from '../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../components/table-tanstack/default-global-filter';

export function WorkerManualFrequencyListPage({
  initialWorkerManualFrequencies,
  refreshAction
}: {
  initialWorkerManualFrequencies: IWorkerManualFrequencyWithRelations[];
  refreshAction: () => void;
}) {
  const router = useRouter();

  const [workerManualFrequencies, setWorkerManualFrequencies] = useState(initialWorkerManualFrequencies);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const handleClearFilters = () => {
    setGlobalFilterValue('');
    inputDebounceRef.current?.clearInput();
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'date',
      desc: true
    }
  ]);

  const handleAddWorkerManualFrequency = () => {
    router.push('worker-manual-frequency/add');
  };

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Frequências Manuais'
        subtitle='Sistema de gerenciamento de frequências manuais de colaboradores'
        TitleIcon={CalendarPlus}
        actionButton={{
          text: 'Cadastrar Frequência',
          onClick: handleAddWorkerManualFrequency,
          variant: 'default',
          Icon: UserPlus
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <DefaultGlobalFilter
          globalFilterValue={globalFilterValue}
          setGlobalFilterValue={setGlobalFilterValue}
          onClearFilter={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
          label={''}
        />
      </div>

      <TableTanstackFaceted
        data={workerManualFrequencies}
        columns={columns(columnActions)}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
        getFacetedRowModel={getFacetedRowModel()}
        getFacetedUniqueValues={getFacetedUniqueValues()}
        globalFilterFn='includesString'
        globalFilter={globalFilterValue}
        setGlobalFilter={setGlobalFilterValue}
      />
    </div>
  );
}
