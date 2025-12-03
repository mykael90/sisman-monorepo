'use client';

'use client';

import { SetStateAction, useCallback, useRef, useState } from 'react';
import { SectionListHeaderSmall } from '@/components/section-list-header-small';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  getCoreRowModel // Importar getCoreRowModel
} from '@tanstack/react-table';
import { Package } from 'lucide-react';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';
import { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import { IMaterialStockMovementMetricsByWarehouse } from '../../metrics-types';
import { getMaterialStockMovementMetricsByWarehouseId } from '../../metrics-actions';
import { columns, createActions, SubRowComponent } from './metrics-columns'; // Importar SubRowComponent
import { MetricsFilters } from './metrics-filters';
import { MetricsCard } from './metrics-card';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';
import { InputDebounceRef } from '../../../../../../../components/ui/input';
import { Separator } from '../../../../../../../components/ui/separator';
import { DateRangeFilter } from '../../../../../../../components/filters/date-range-filter';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

export function MetricsListPage() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [date, setDateState] = useState<DateRange | undefined>({
    from: subDays(startOfDay(new Date()), 100),
    to: addDays(endOfDay(new Date()), 100) // Usar endOfDay para definir o final do dia
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>(
    []
  );

  const [globalFilterValue, setGlobalFilterValueState] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100
  });

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
    data: metricsData,
    isLoading,
    isError,
    error
  } = useQuery<IMaterialStockMovementMetricsByWarehouse[], Error>({
    queryKey: ['materialMetrics', warehouse?.id, date],
    queryFn: () =>
      getMaterialStockMovementMetricsByWarehouseId(warehouse?.id as number, {
        from: date?.from,
        to: date?.to
      }),
    enabled: !!warehouse
  });

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto pb-6'>
      <SectionListHeaderSmall
        title='Métricas de Movimentação de Materiais'
        subtitle='Visualização agregada das movimentações de materiais'
        TitleIcon={Package}
        // Não há botão de ação para "Cadastrar" em métricas, então vou remover.
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
        // Passa os valores e setters para o componente
        globalFilterValue={globalFilterValue}
        setGlobalFilterValue={setGlobalFilterValue}
        onClearFilter={handleClearFilters} // Passa a função de limpar
        inputDebounceRef={inputDebounceRef} // Passa a ref
        label={'Material'}
      />

      {isLoading ? (
        <Loading />
      ) : isDesktop ? (
        <TableTanstack
          data={metricsData || []}
          columns={columns(columnActions)}
          columnFilters={columnFilters}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
          renderSubComponent={({ row }) => <SubRowComponent row={row} />} // Adicionar SubRowComponent
          globalFilterFn='includesString'
          globalFilter={globalFilterValue}
          setGlobalFilter={setGlobalFilterValue}
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {metricsData?.map(
            (metrics: IMaterialStockMovementMetricsByWarehouse) => (
              <MetricsCard key={metrics.materialId} metrics={metrics} />
            )
          )}
        </div>
      )}
    </div>
  );
}
