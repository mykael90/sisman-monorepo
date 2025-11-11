'use client';

import { useState, useRef } from 'react';
import { SectionListHeader } from '@/components/section-list-header';
import { WarehouseStockFilters } from './warehouse-stock-filters';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  const [showOnlyCounted, setShowOnlyCounted] = useState(false);

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20
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
    setColumnFilters([]);
    setShowOnlyCounted(false); // Limpa o filtro do checkbox também
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
        <div className='mt-4 flex items-center space-x-2'>
          <Checkbox
            id='showOnlyCounted'
            checked={showOnlyCounted}
            onCheckedChange={(checked) => {
              setShowOnlyCounted(!!checked);
              setColumnFilters((prev) => [
                ...prev.filter((f) => f.id !== 'lastStockCountDate'),
                {
                  id: 'lastStockCountDate',
                  value: !!checked,
                  filterFn: 'isNotNullFilter'
                }
              ]);
            }}
          />
          <Label htmlFor='showOnlyCounted' className='text-muted-foreground'>
            Mostrar apenas materiais contabilizados
          </Label>
        </div>
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
