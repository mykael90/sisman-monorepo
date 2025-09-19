'use client';

import {
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useEffect,
  use
} from 'react';
import { SectionListHeader } from '@/components/section-list-header';
import {
  ColumnDef,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { IPickingOrderWithRelations } from '../../picking-order-types';
import { useRouter } from 'next/navigation';
import {
  columns,
  createActions,
  SubRowComponent
} from './picking-order-columns';
import { FilterX, Package, PackagePlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { getPickingOrdersByWarehouse } from '../../picking-order-actions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PickingOrderCard } from './picking-order-card';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { Button } from '@/components/ui/button';
import { TableTanstackFaceted } from '../../../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';

export function PickingOrderListPage() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 10),
    to: new Date()
  });

  const [sorting, setSorting] = useState<SortingState>([]);

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

  const {
    data: pickingOrders,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['pickingOrders', warehouse?.id, date],
    queryFn: () =>
      getPickingOrdersByWarehouse(warehouse?.id as number, {
        from: date?.from,
        to: date?.to
      }),
    enabled: !!warehouse && !!date?.from && !!date?.to
  });

  const pickingOrderValue =
    (columnFilters.find((f) => f.id === 'id')?.value as string) ?? '';

  const setPickingOrderValue = (value: string) => {
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

  const handleAddPickingOrder = () => {
    router.push('picking-order/add');
  };

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto'>
      <SectionListHeaderSmall
        title='Gerenciamento de Ordens de Picking'
        subtitle='Sistema de gerenciamento de ordens de picking'
        TitleIcon={Package}
        actionButton={{
          text: 'Cadastrar Ordem de Picking',
          onClick: handleAddPickingOrder,
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
      ) : isDesktop ? (
        <TableTanstackFaceted
          data={pickingOrders}
          columns={columns(columnActions)}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
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
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {pickingOrders.map((pickingOrder: IPickingOrderWithRelations) => (
            <PickingOrderCard
              key={pickingOrder.id}
              pickingOrder={pickingOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
