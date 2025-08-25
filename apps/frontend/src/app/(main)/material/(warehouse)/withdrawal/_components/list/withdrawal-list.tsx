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
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { useQuery } from '@tanstack/react-query'; // <-- IMPORTANTE
import Loading from '@/components/loading';
import { getWithdrawalsByWarehouse } from '../../withdrawal-actions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { WithdrawalCard } from './withdrawal-card';

export function WithdrawalListPage() {
  // 1. Consuma o contexto
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // console.log(JSON.stringify(initialWithdrawalsByWarehouse2));
  // console.log(JSON.stringify(initialWithdrawalsByWarehouse));

  // const [withdrawals, setWithdrawals] = useState(initialWithdrawalsByWarehouse);

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

  // 1. USE O HOOK useQuery PARA BUSCAR E GERENCIAR OS DADOS
  const {
    data: withdrawals, // 'data' é renomeado para 'withdrawals'
    isLoading, // Estado de carregamento, gerenciado para você
    isError, // Estado de erro, gerenciado para você
    error // O objeto de erro, se houver
  } = useQuery({
    // 2. Chave da Query: um array que identifica unicamente esta busca.
    //    Quando 'warehouse.id' mudar, o TanStack Query refaz a busca automaticamente!
    queryKey: ['withdrawals', warehouse?.id],

    // 3. Função da Query: a função assíncrona que retorna os dados.
    queryFn: () => getWithdrawalsByWarehouse(warehouse?.id as number),

    // 4. Habilitar/Desabilitar: A busca só será executada se 'warehouse' existir.
    //    Isso é crucial e muito mais limpo que um 'if' dentro do useEffect.
    enabled: !!warehouse
  });

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

      {/* A verificação de 'isLoading' vem diretamente do useQuery */}
      {isLoading ? (
        <Loading />
      ) : isDesktop ? (
        <TableTanstack
          data={withdrawals}
          columns={columns(columnActions)}
          columnFilters={columnFilters}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withdrawals.map((withdrawal: IMaterialWithdrawalWithRelations) => (
            <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
          ))}
        </div>
      )}
    </div>
  );
}
