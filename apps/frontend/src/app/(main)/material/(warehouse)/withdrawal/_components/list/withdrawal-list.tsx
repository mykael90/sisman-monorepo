'use client';

import {
  use,
  useState,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction
} from 'react';
import { SectionListHeader } from '@/components/section-list-header';
import { WithdrawalFilters } from './withdrawal-filters';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { IMaterialWithdrawalWithRelations } from '../../withdrawal-types';
import { useRouter } from 'next/navigation';
import { columns, createActions } from './withdrawal-columns';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';
import { Package, PackagePlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';

export function WithdrawalListPage({
  initialWithdrawals,
  refreshAction
}: {
  initialWithdrawals: IMaterialWithdrawalWithRelations[];
  refreshAction: () => void;
}) {
  const router = useRouter();

  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);

  const [withdrawalValue, setWithdrawalValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'id',
      desc: false
    }
  ]);

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (withdrawalValue) {
      filters.push({ id: 'id', value: withdrawalValue });
    }
    return filters;
  }, [withdrawalValue]);

  const handleClearFilters = () => {
    setWithdrawalValue('');
    inputDebounceRef.current?.clearInput();
  };

  const handleAddWithdrawal = () => {
    router.push('withdrawal/add');
  };

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto'>
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
        <WithdrawalFilters
          withdrawalValue={withdrawalValue}
          setWithdrawalValue={setWithdrawalValue}
          onClearFilters={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
        />
      </div>

      <TableTanstack
        data={withdrawals}
        columns={columns(columnActions)}
        columnFilters={columnFilters}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
}
