'use client';

import { useState } from 'react';
import { SectionListHeaderSmall } from '@/components/section-list-header-small';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { Package, PackagePlus } from 'lucide-react'; // Ajustar ícones se necessário
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';
import { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import { IMaterialStockMovementMetricsByWarehouse } from '../../metrics-types';
import { getMaterialStockMovementMetricsByWarehouseId } from '../../metrics-actions';
import { columns, createActions } from './metrics-columns';
import { MetricsFilters } from './metrics-filters';
import { MetricsCard } from './metrics-card';

export function MetricsListPage() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20
  });

  const {
    data: metricsData,
    isLoading,
    isError,
    error
  } = useQuery<IMaterialStockMovementMetricsByWarehouse[], Error>({
    queryKey: ['materialMetrics', warehouse?.id, dateRange],
    queryFn: () =>
      getMaterialStockMovementMetricsByWarehouseId(warehouse?.id as number, {
        from: dateRange?.from,
        to: dateRange?.to
      }),
    enabled: !!warehouse
  });

  const handleClearFilters = () => {
    setDateRange(undefined);
    setColumnFilters([]);
  };

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
        <MetricsFilters
          date={dateRange}
          setDate={setDateRange}
          onClearFilters={handleClearFilters}
        />
      </div>

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
          // Filtro global não é necessário para métricas com filtro de data
          // globalFilterFn='includesString'
          // globalFilter={globalFilterValue}
          // setGlobalFilter={setGlobalFilterValue}
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
