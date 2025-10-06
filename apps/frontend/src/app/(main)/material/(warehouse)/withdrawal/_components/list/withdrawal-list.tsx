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
import { WithdrawalFilters } from './withdrawal-filters';
import {
  ColumnDef,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { IMaterialWithdrawalWithRelations } from '../../withdrawal-types';
import { useRouter } from 'next/navigation';
import { columns, createActions, SubRowComponent } from './withdrawal-columns';
import { FilterX, Package, PackagePlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery } from '@tanstack/react-query'; // <-- IMPORTANTE
import Loading from '@/components/loading';
import { getWithdrawalsByWarehouse } from '../../withdrawal-actions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { WithdrawalCard } from './withdrawal-card';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { Button } from '@/components/ui/button';
import { TableTanstackFaceted } from '../../../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';

export function WithdrawalListPage() {
  // 1. Consuma o contexto
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 10),
    to: new Date()
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setGlobalFilterValue('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  // 1. USE O HOOK useQuery PARA BUSCAR E GERENCIAR OS DADOS
  const {
    data: withdrawals, // 'data' é renomeado para 'withdrawals'
    isLoading, // Estado de carregamento, gerenciado para você
    isError, // Estado de erro, gerenciado para você
    error // O objeto de erro, se houver
  } = useQuery({
    queryKey: ['withdrawals', warehouse?.id, date],
    queryFn: () =>
      getWithdrawalsByWarehouse(warehouse?.id as number, {
        from: date?.from,
        to: date?.to
      }),
    enabled: !!warehouse && !!date?.from && !!date?.to
  });

  const withdrawalValue =
    (columnFilters.find((f) => f.id === 'id')?.value as string) ?? '';

  const setWithdrawalValue = (value: string) => {
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

  const handleAddWithdrawal = () => {
    router.push('withdrawal/add');
  };

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto pb-6'>
      <SectionListHeaderSmall
        title='Gerenciamento de Retiradas de Materiais'
        subtitle='Sistema de gerenciamento de retiradas de materiais'
        TitleIcon={Package}
        actionButton={{
          text: 'Cadastrar Retirada',
          onClick: handleAddWithdrawal,
          variant: 'default',
          Icon: PackagePlus
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

      {/* <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <WithdrawalFilters
          withdrawalValue={withdrawalValue}
          setWithdrawalValue={setWithdrawalValue}
          onClearFilters={handleClearFrontendFilters}
          inputDebounceRef={inputDebounceRef}
        />
      </div> */}

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        {' '}
        {/* Ajuste altura se necessário */}
        <DefaultGlobalFilter
          // Passa os valores e setters para o componente
          globalFilterValue={globalFilterValue}
          setGlobalFilterValue={setGlobalFilterValue}
          onClearFilter={handleClearFilters} // Passa a função de limpar
          inputDebounceRef={inputDebounceRef} // Passa a ref
          label={''}
        />
      </div>

      {/* A verificação de 'isLoading' vem diretamente do useQuery */}
      {isLoading ? (
        <Loading />
      ) : isDesktop ? (
        <TableTanstackFaceted
          data={withdrawals}
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
          {withdrawals.map((withdrawal: IMaterialWithdrawalWithRelations) => (
            <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
          ))}
        </div>
      )}
    </div>
  );
}
