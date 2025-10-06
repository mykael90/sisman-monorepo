'use client';
import { useState, useRef, SetStateAction, useCallback } from 'react';
import {
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  columns,
  createActions,
  defaultColumn,
  SubRowComponent
} from './material-request-columns'; // Alterado
import { Package, PackagePlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../components/section-list-header-small';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { getRequests } from '../../material-request-actions'; // Alterado
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { TableTanstackFaceted } from '../../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../../components/table-tanstack/default-global-filter';

export function MaterialRequestListPage() {
  // Alterado
  const router = useRouter();
  // const isDesktop = useMediaQuery('(min-width: 768px)');
  const queryClient = useQueryClient();

  const [date, setDateState] = useState<DateRange | undefined>({
    from: subDays(new Date(), 10),
    to: new Date()
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const initialColumnFilter: ColumnFiltersState = [];

  const [columnFilters, setColumnFiltersState] =
    useState<ColumnFiltersState>(initialColumnFilter);

  const [globalFilterValue, setGlobalFilterValueState] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  // --- Wrappers para os setters dos filtros ---
  // Esses wrappers garantem que, ao aplicar um filtro, a paginação seja resetada para a primeira página
  // (porque autoResetPageIndex é false agora).

  const setDate = useCallback(
    (updater: SetStateAction<DateRange | undefined>) => {
      setDateState(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reseta para a primeira página ao aplicar filtro de data
    },
    []
  );

  const setGlobalFilterValue = useCallback(
    (updater: SetStateAction<string>) => {
      setGlobalFilterValueState(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reseta para a primeira página ao aplicar filtro global
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
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reseta para a primeira página ao aplicar filtro de coluna
    },
    []
  );
  // --- Fim dos Wrappers dos filtros ---

  const handleClearFilters = () => {
    setGlobalFilterValue(''); // Usa o setter modificado
    inputDebounceRef.current?.clearInput();
  };

  const {
    data: materialRequests, // Alterado
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['materialRequests', date], // Alterado
    queryFn: () => getRequests({ from: date?.from, to: date?.to }), // Alterado
    enabled: !!date?.from && !!date?.to // Manter se for relevante, caso contrário remover
  });

  const materialRequestValue = // Alterado
    (columnFilters.find((f) => f.id === 'id')?.value as string) ?? '';

  const setMaterialRequestValue = (value: string) => {
    // Alterado
    setColumnFilters((prev) => {
      const idFilter = prev.find((f) => f.id === 'id');
      const otherFilters = prev.filter((f) => f.id !== 'id');
      if (value) {
        return [...otherFilters, { id: 'id', value }];
      }
      return otherFilters;
    });
  };

  const handleClearFrontendFilters = () => {
    setColumnFilters((prev) => prev.filter((f) => f.id !== 'id'));
    inputDebounceRef.current?.clearInput();
  };

  const handleClearDateFilter = () => {
    setDate({
      from: subDays(new Date(), 10),
      to: new Date()
    });
  };

  const handleAddMaterialRequest = () => {
    // Alterado
    router.push('request/add'); // Alterado
  };

  const columnActions = createActions(router, queryClient);

  return (
    <div className='container mx-auto pb-6'>
      <SectionListHeaderSmall
        title='Gerenciamento de Requisições de Material' // Alterado
        subtitle='Sistema de gerenciamento de Requisições de Material' // Alterado
        TitleIcon={Package}
        actionButton={{
          text: 'Cadastrar Requisição de Material', // Alterado
          onClick: handleAddMaterialRequest, // Alterado
          variant: 'default',
          Icon: PackagePlus
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <DateRangeFilter date={date} setDate={setDate} />
        </div>
      </div>

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
          data={materialRequests} // Alterado
          columns={columns(columnActions)}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          defaultColumn={defaultColumn}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
          renderSubComponent={SubRowComponent}
          getFacetedRowModel={getFacetedRowModel()}
          getFacetedUniqueValues={getFacetedUniqueValues()}
          globalFilterFn='includesString'
          globalFilter={globalFilterValue}
          setGlobalFilter={setGlobalFilterValue}
          autoResetPageIndex={false}
        />
      )}
    </div>
  );
}
