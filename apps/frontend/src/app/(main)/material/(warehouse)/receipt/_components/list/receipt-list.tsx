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

export function ReceiptListPage() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [receiptValue, setReceiptValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null);

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

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (receiptValue) {
      filters.push({ id: 'id', value: receiptValue });
    }
    return filters;
  }, [receiptValue]);

  const handleClearFilters = () => {
    setReceiptValue('');
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
        <ReceiptFilters
          receiptValue={receiptValue}
          setReceiptValue={setReceiptValue}
          onClearFilters={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : isDesktop ? (
        <TableTanstack
          data={receipts}
          columns={columns(columnActions)}
          columnFilters={columnFilters}
          pagination={pagination}
          setPagination={setPagination}
          renderSubComponent={SubRowComponent}
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
