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
import { WarehouseStockFilters } from './warehouse-stock-filters';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { IWarehouseStockWithRelations } from '../../warehouse-stock-types';
import { useRouter } from 'next/navigation';
import { columns, createActions } from './warehouse-stock-columns';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';
import { Package, PackagePlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { getWarehouseStocks } from '../../warehouse-stock-actions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { WarehouseStockCard } from './warehouse-stock-card';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';

export function WarehouseStockListPage() {
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

  // const [sorting, setSorting] = useState<SortingState>([
  //   {
  //     id: 'id',
  //     desc: false
  //   }
  // ]);

  const {
    data: warehouseStocks,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['warehouseStocks', warehouse?.id],
    queryFn: () => getWarehouseStocks(warehouse?.id as number),
    enabled: !!warehouse
  });

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setGlobalFilterValue('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  const handleAddWarehouseStock = () => {
    router.push('warehouse-stock/add');
  };

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto pb-6'>
      <SectionListHeaderSmall
        title='Gerenciamento de Estoque de Materiais'
        subtitle='Sistema de gerenciamento de estoque de materiais'
        TitleIcon={Package}
        actionButton={{
          text: 'Cadastrar Estoque',
          onClick: handleAddWarehouseStock,
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
          label={'Material'}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : isDesktop ? (
        <TableTanstack
          data={warehouseStocks}
          columns={columns(columnActions)}
          columnFilters={columnFilters}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
          // TODO: funcao para filtro
          globalFilterFn='includesString'
          globalFilter={globalFilterValue}
          setGlobalFilter={setGlobalFilterValue}
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {warehouseStocks.map(
            (warehouseStock: IWarehouseStockWithRelations) => (
              <WarehouseStockCard
                key={warehouseStock.id}
                warehouseStock={warehouseStock}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
