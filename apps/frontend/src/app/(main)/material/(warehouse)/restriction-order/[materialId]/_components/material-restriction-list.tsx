'use client';

import { useState, useRef, SetStateAction, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { SectionListHeaderSmall } from '@/components/section-list-header-small';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { IRestrictionsItemsByWarehouseAndByMaterialId } from '../../restriction-order-types';
import { getMaterialsRestrictedByWarehouseAndMaterial } from '../../restriction-order-actions';
import { TableTanstackFaceted } from '@/components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '@/components/table-tanstack/default-global-filter';
import {
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { columns, createActions } from './material-restriction-columns';

export function MaterialRestrictionListByWarehouseAndMaterial({
  globalMaterial
}: {
  globalMaterial: any;
}) {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const setGlobalFilterValue = useCallback(
    (updater: SetStateAction<string>) => {
      setGlobalFilterValueState(updater);
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
  };

  const {
    data: restrictionsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<IRestrictionsItemsByWarehouseAndByMaterialId[], Error>({
    queryKey: [
      'materialRestrictionByWarehouseIdAndMaterialId',
      warehouse?.id,
      globalMaterial?.id
    ],
    queryFn: () =>
      getMaterialsRestrictedByWarehouseAndMaterial(
        warehouse?.id as number,
        globalMaterial?.id as string
      ),
    enabled: !!warehouse && !!globalMaterial
  });

  const columnActions = createActions(router, queryClient);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className='text-red-500'>
        Erro ao carregar restrições: {error?.message}
      </div>
    );
  }

  return (
    <div className='container mx-auto pb-6'>
      <SectionListHeaderSmall
        title={`Restrições do Material: ${globalMaterial?.name || globalMaterial.id}`}
        subtitle={`Depósito: ${warehouse?.name || warehouse?.id}`}
        TitleIcon={LockKeyhole}
        actionButton={{
          text: 'Voltar',
          onClick: () => router.back(),
          variant: 'outline',
          Icon: ArrowLeft
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <DefaultGlobalFilter
          globalFilterValue={globalFilterValue}
          setGlobalFilterValue={setGlobalFilterValue}
          onClearFilter={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
          label={''}
        />
      </div>

      <div className='mt-4'>
        <TableTanstackFaceted
          data={restrictionsData || []}
          columns={columns(columnActions)}
          pagination={pagination}
          setPagination={setPagination}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          sorting={sorting}
          setSorting={setSorting}
          getFacetedRowModel={getFacetedRowModel()}
          getFacetedUniqueValues={getFacetedUniqueValues()}
          globalFilterFn='includesString'
          globalFilter={globalFilterValue}
          setGlobalFilter={setGlobalFilterValue}
          autoResetPageIndex={false}
        />
      </div>
    </div>
  );
}
