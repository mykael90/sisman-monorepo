'use client';

import { useState, useRef, useMemo } from 'react';
import { SectionListHeader } from '../../../../../components/section-list-header';
import {
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import {
  IWorkerManualFrequencyForContractsWithRelations,
  IWorkerManualFrequencyForSpecialtiesWithRelations
} from '../../worker-manual-frequency-types';
import { useRouter } from 'next/navigation';
import {
  columns,
  createActions,
  createActionsSubrows,
  SubRowComponent
} from './worker-manual-frequency-columns';
import { UserPlus, CalendarPlus } from 'lucide-react';
import { TableTanstackFaceted } from '../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../components/table-tanstack/default-global-filter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { getWorkerManualFrequenciesForSpecialties } from '../../worker-manual-frequency-actions';
import Loading from '../../../../../components/loading';
import { DateRangeFilter } from '../../../../../components/filters/date-range-filter';
import { TableSummaryFrequenciesSpecialties } from './table-summary-frequencies-specialties';

export function WorkerManualFrequencyListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(startOfDay(new Date())),
    to: endOfMonth(endOfDay(new Date()))
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const handleClearFilters = () => {
    setGlobalFilterValue('');
    inputDebounceRef.current?.clearInput();
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false
    }
  ]);

  const {
    data: workerManualFrequenciesForSpecialties,
    isLoading,
    isError,
    error
  } = useQuery<IWorkerManualFrequencyForSpecialtiesWithRelations[], unknown>({
    queryKey: ['workerManualFrequenciesForSpecialties', date],
    queryFn: () =>
      getWorkerManualFrequenciesForSpecialties({
        from: date?.from,
        to: date?.to
      }),
    enabled: !!date?.from && !!date?.to
  });

  const data: IWorkerManualFrequencyForContractsWithRelations[] =
    useMemo(() => {
      return (
        workerManualFrequenciesForSpecialties
          ?.map((item) => item.workerContracts)
          .flat() || []
      );
    }, [workerManualFrequenciesForSpecialties]);

  const handleAddWorkerManualFrequency = () => {
    router.push('worker-manual-frequency/add-bulk');
  };

  const columnActions = createActions(router);
  const columnActionsSubrows = createActionsSubrows(router, queryClient);

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
        <div className='flex flex-col gap-4 md:flex-row'>
          <DateRangeFilter date={date} setDate={setDate} />
          {/* <Button
                  variant='outline'
                  onClick={handleClearDateFilter}
                  className='flex items-center'
                >
                  <FilterX className='mr-2 h-4 w-4' />
                  Limpar Filtro de Data
                </Button> */}
        </div>
      </div>

      {/* Usando details e summary para resumo de frequencias por especialidade */}
      <details className='mt-4 w-full'>
        <summary className='text-muted-foreground cursor-pointer text-sm'>
          <span className=''>Resumo de frequências por especialidade </span>
        </summary>
        <div className='mt-4'>
          <TableSummaryFrequenciesSpecialties
            workerManualFrequencies={workerManualFrequenciesForSpecialties}
          />
        </div>
      </details>

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <DefaultGlobalFilter
          globalFilterValue={globalFilterValue}
          setGlobalFilterValue={setGlobalFilterValue}
          onClearFilter={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
          label={''}
        />
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <TableTanstackFaceted
          data={data}
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
          renderSubComponent={({ row }) => (
            <SubRowComponent
              row={row}
              configuredActionsSubrows={columnActionsSubrows}
            />
          )}
          // debugTable={true}
        />
      )}
    </div>
  );
}
