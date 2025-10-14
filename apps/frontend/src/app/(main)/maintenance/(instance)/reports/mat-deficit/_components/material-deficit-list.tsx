'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useCallback, Dispatch, SetStateAction } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createActions,
  defaultColumn,
  materialdeficitColumns,
  SubRowComponent
} from './material-deficit-columns';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { TableTanstackFaceted } from '../../../../../../../components/table-tanstack/table-tanstack-faceted';
import { listMaintenanceRequestDeficitByMaintenanceInstance } from '../../../../request/maintenance-request-actions';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';
import { DateRange } from 'react-day-picker';
import { endOfMonth, startOfMonth, subDays } from 'date-fns';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Loading from '../../../../../../../components/loading';

export function MateriallDeficitList() {
  const { data: session, status, update } = useSession();
  //TODO: pegar do contexto auth a instancia de manutencao
  const router = useRouter();

  const queryClient = useQueryClient();

  const maintenanceInstanceId = session?.user.maintenanceInstanceId;

  if (status !== 'loading' && !maintenanceInstanceId) {
    toast.error('Precisa está vinculado a uma instância de manutenção');
    console.log(`Precisa está vinculado a uma instância de manutenção`);
    router.push('/');
    return null;
  }

  const [date, setDateState] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>([
    {
      id: 'hasEffectiveDeficit',
      value: ['Sim']
    }
  ]);

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValueState] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setGlobalFilterValue('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10 //default page size
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

  const {
    data: deficits,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['deficits', maintenanceInstanceId, date],
    queryFn: () =>
      listMaintenanceRequestDeficitByMaintenanceInstance(
        maintenanceInstanceId as number,
        {
          from: date?.from,
          to: date?.to
        }
      ),
    enabled: !!maintenanceInstanceId && !!date?.from && !!date?.to
    // placeholderData: keepPreviousData // don't have 0 rows flash while changing pages/loading next page
  });

  //Configurando açoes de colunas. Ações de colunas definidas no arquivo de colunas
  const columnActions = createActions(router, queryClient); // Crie o objeto de ações, passando a função de navegação

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeaderSmall
        title='Requisições de Manutenção: Relatório do Status de Déficits'
        subtitle='Relatório do Status de Déficits'
        // TitleIcon={}
        // actionButton={{
        //   text: 'Cadastrar depósito',
        //   //   onClick: handleAddMaterialDeficit,
        //   variant: 'default',
        //   Icon: FilePlus
        // }}
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

      {/* AQUI ESTÁ A MUDANÇA */}
      {isLoading ? (
        <Loading /> // Ou qualquer outro indicador de carregamento
      ) : (
        <TableTanstackFaceted
          data={deficits ?? []}
          columns={materialdeficitColumns(columnActions)}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
          getFacetedRowModel={getFacetedRowModel()}
          getFacetedUniqueValues={getFacetedUniqueValues()}
          globalFilterFn='includesString'
          globalFilter={globalFilterValue}
          setGlobalFilter={setGlobalFilterValue}
          defaultColumn={defaultColumn}
          renderSubComponent={SubRowComponent}
          autoResetPageIndex={false}
        />
      )}
    </div>
  );
}
