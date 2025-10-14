'use client';

import {
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useEffect,
  use,
  useCallback
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
import { IMaterialPickingOrderWithRelations } from '../../material-picking-order-types';
import { useRouter } from 'next/navigation';
import {
  columns,
  createActions,
  defaultColumn,
  SubRowComponent
} from './picking-order-columns';
import { FilterX, Package, PackagePlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { getMaterialPickingOrdersByWarehouse } from '../../material-picking-order-actions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PickingOrderCard } from './picking-order-card';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { Button } from '@/components/ui/button';
import { TableTanstackFaceted } from '../../../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';
import { materialPickingOrderStatusDisplayMapPortuguese } from '../../../../../../../mappers/material-picking-order-mappers-translate';

export function PickingOrderListPage() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  // const isDesktop = useMediaQuery('(min-width: 768px)');
  const queryClient = useQueryClient();

  const [date, setDateState] = useState<DateRange | undefined>({
    from: subDays(new Date(), 10),
    to: new Date()
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  //vamos definir um estado inicial de filtragem englobando "pendente de preparação" e "pronto para retirada"
  const initialColumnFilter: ColumnFiltersState = [
    {
      id: 'status',
      value: [
        materialPickingOrderStatusDisplayMapPortuguese.PENDING_PREPARATION,
        materialPickingOrderStatusDisplayMapPortuguese.READY_FOR_PICKUP
      ]
    }
  ];

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

  const setDate = useCallback((range: DateRange | undefined) => {
    setDateState(range);
    setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reseta para a primeira página ao aplicar filtro de data
  }, []);

  const setGlobalFilterValue = useCallback((value: string) => {
    setGlobalFilterValueState(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reseta para a primeira página ao aplicar filtro global
  }, []);

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

  const prevPickingOrdersCount = useRef<number | undefined>(0);

  // Crie uma versão memoizada e estável da sua função de busca
  const fetchData = useCallback(() => {
    // O enabled garante que isso não rode se warehouse ou date não existirem
    return getMaterialPickingOrdersByWarehouse(warehouse!.id, {
      from: date!.from,
      to: date!.to
    });
  }, [warehouse, date]); // <-- Dependências CRUCIAIS

  const {
    data: pickingOrders,
    isLoading,
    isError,
    error,
    refetch,
    isSuccess
  } = useQuery<IMaterialPickingOrderWithRelations[]>({
    // DEPOIS (Estável e Correto)
    // Usamos os valores primitivos (strings) que não mudam de referência a cada renderização.
    queryKey: [
      'pickingOrders',
      warehouse?.id,
      date?.from?.toISOString(),
      date?.to?.toISOString()
    ],
    queryFn: fetchData,
    enabled: !!warehouse && !!date?.from && !!date?.to,
    refetchInterval: 15000,
    refetchIntervalInBackground: true, // Garante que o refetch ocorra mesmo em segundo plano
    refetchOnWindowFocus: true, // Garante que o refetch ocorra ao focar na janela

    // A SOLUÇÃO:
    // Considera os dados frescos por 10 segundos.
    // Isso previne o refetch imediato ao focar na janela se a última
    // busca foi há menos de 10 segundos.
    staleTime: 10000
  });

  useEffect(() => {
    if (isSuccess && pickingOrders) {
      if (
        prevPickingOrdersCount.current !== undefined &&
        pickingOrders.length > prevPickingOrdersCount.current
      ) {
        const audio = new Audio('/assets/sounds/notification.mp3');
        audio.play();

        // Reseta os filtros e a paginação para garantir que o novo registro seja visível
        setColumnFiltersState(initialColumnFilter);
        setPagination({ pageIndex: 0, pageSize: 10 });
        setGlobalFilterValueState('');
        inputDebounceRef.current?.clearInput();
      }
      prevPickingOrdersCount.current = pickingOrders.length;
    }
  }, [
    isSuccess,
    pickingOrders,
    initialColumnFilter,
    setColumnFiltersState,
    setPagination,
    setGlobalFilterValueState,
    inputDebounceRef
  ]);

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

  const columnActions = createActions(router, queryClient);

  return (
    <div className='container mx-auto pb-6'>
      <SectionListHeaderSmall
        title='Gerenciamento de Ordens de Reserva'
        subtitle='Sistema de gerenciamento de ordens de Reserva'
        TitleIcon={Package}
        actionButton={{
          text: 'Cadastrar Ordem de Reserva',
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
      ) : (
        <TableTanstackFaceted
          data={pickingOrders || []}
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
