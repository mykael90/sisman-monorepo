'use client';

import {
  useState,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction,
  useEffect,
  use
} from 'react';
import { SectionListHeader } from '@/components/section-list-header';
import { ReceiptFilters } from './receipt-filters';
import {
  ColumnDef,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { IMaterialReceiptWithRelations } from '../../receipt-types';
import { useRouter } from 'next/navigation';
import { columns, createActions, SubRowComponent } from './receipt-columns';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';
import { Package, PackagePlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { getReceiptsByWarehouse } from '../../receipt-actions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ReceiptCard } from './receipt-card';
import { TableTanstackFaceted } from '../../../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';

export function ReceiptListPage() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const {
    data: receipts,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['receipts', warehouse?.id],
    queryFn: () => getReceiptsByWarehouse(warehouse?.id as number),
    enabled: !!warehouse
  });

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setGlobalFilterValue('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  const handleAddReceipt = () => {
    router.push('receipt/add');
  };

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto'>
      <SectionListHeaderSmall
        title='Gerenciamento de Entradas de Materiais'
        subtitle='Sistema de gerenciamento de entradas de materiais'
        TitleIcon={Package}
        actionButton={{
          text: 'Cadastrar Entrada',
          onClick: handleAddReceipt,
          variant: 'default',
          Icon: PackagePlus
        }}
      />

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

      {isLoading ? (
        <Loading />
      ) : isDesktop ? (
        <TableTanstackFaceted
          data={receipts}
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
          {receipts?.map((receipt: IMaterialReceiptWithRelations) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))}
        </div>
      )}
    </div>
  );
}
