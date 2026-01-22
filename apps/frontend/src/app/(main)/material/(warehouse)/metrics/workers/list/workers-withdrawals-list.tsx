'use client';

import { SetStateAction, useCallback, useRef, useState } from 'react';
import { SectionListHeaderSmall } from '@/components/section-list-header-small';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues
} from '@tanstack/react-table';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { TableTanstackFaceted } from '@/components/table-tanstack/table-tanstack-faceted';
import { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';
import { listWorkersWithdrawals } from '@/app/(main)/worker/worker-actions';
import { IWorkerWithdrawals } from '@/app/(main)/worker/worker-types';
import {
  columns,
  createActions,
  defaultColumn,
  SubRowComponent
} from './workers-withdrawals-columns';
import { WorkersWithdrawalsFilters } from './workers-withdrawals-filters';
import { DefaultGlobalFilter } from '@/components/table-tanstack/default-global-filter';
import { InputDebounceRef } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  addDays,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays
} from 'date-fns';
import { DateRangeFilter } from '../../../../../../../components/filters/date-range-filter';

export function WorkersWithdrawalsListPage() {
  const router = useRouter();

  const [date, setDateState] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>(
    []
  );

  const [globalFilterValue, setGlobalFilterValueState] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const setGlobalFilterValue = useCallback(
    (updater: SetStateAction<string>) => {
      setGlobalFilterValueState(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const setDate = useCallback(
    (updater: SetStateAction<DateRange | undefined>) => {
      setDateState(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const setColumnFilters = useCallback(
    (
      updater:
        | ColumnFiltersState
        | ((old: ColumnFiltersState) => ColumnFiltersState)
    ) => {
      setColumnFiltersState(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  const handleClearFilters = () => {
    setGlobalFilterValue('');
    inputDebounceRef.current?.clearInput();
    setDate({
      from: subDays(startOfDay(new Date()), 30),
      to: endOfDay(new Date())
    });
    setColumnFilters([]);
  };

  const { data: workersWithdrawalsData, isLoading } = useQuery<
    IWorkerWithdrawals[],
    Error
  >({
    queryKey: ['workersWithdrawals', date],
    queryFn: () =>
      listWorkersWithdrawals({
        from: date?.from,
        to: date?.to
      }),
    enabled: !!date?.from && !!date?.to
  });

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto pb-6'>
      <SectionListHeaderSmall
        title='Retiradas de Materiais por Trabalhador'
        subtitle='Visualização das retiradas de materiais por cada trabalhador'
        TitleIcon={Users}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <div className='text-md mb-2 font-semibold'>
          Métricas retornadas no intervalo das datas
        </div>

        <Separator className='my-2' />
        <div className='flex flex-col gap-4 md:flex-row'>
          <DateRangeFilter date={date} setDate={setDate} />
        </div>
      </div>

      <DefaultGlobalFilter
        globalFilterValue={globalFilterValue}
        setGlobalFilterValue={setGlobalFilterValue}
        onClearFilter={handleClearFilters}
        inputDebounceRef={inputDebounceRef}
        label={'Trabalhador'}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <TableTanstackFaceted
          data={workersWithdrawalsData || []}
          columns={columns(columnActions)}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          defaultColumn={defaultColumn}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
          renderSubComponent={({ row }) => <SubRowComponent row={row} />}
          getFacetedRowModel={getFacetedRowModel()}
          getFacetedUniqueValues={getFacetedUniqueValues()}
          globalFilterFn='includesString'
          globalFilter={globalFilterValue}
          setGlobalFilter={setGlobalFilterValue}
        />
      )}
    </div>
  );
}
