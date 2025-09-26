'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useReducer, useRef, useState } from 'react';
import {
  ColumnFiltersState,
  getFacetedRowModel,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, FilePlus } from 'lucide-react'; // Added MaterialDeficit and FilePlus icons
import { InputDebounceRef } from '@/components/ui/input';
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery
} from '@tanstack/react-query';
import {
  createActions,
  materialdeficitColumns
} from './material-deficit-columns';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { TableTanstackFaceted } from '../../../../../../../components/table-tanstack/table-tanstack-faceted';
import {
  listMaintenanceRequestDeficitByMaintenanceInstance,
  listMaintenanceRequestDeficitPaginated
} from '../../../../request/maintenance-request-actions';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DefaultGlobalFilter } from '../../../../../../../components/table-tanstack/default-global-filter';
import { DateRangeFilter } from '../../../../../../../components/filters/date-range-filter';

export function MaterialDeficitList() {
  //TODO: pegar do contexto auth a instancia de manutencao
  const maintenanceInstanceId = 1;

  const router = useRouter();

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 1000),
    to: new Date()
  });

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10 //default page size
  });

  const {
    data: deficits,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['deficits', maintenanceInstanceId, date],
    queryFn: () =>
      listMaintenanceRequestDeficitByMaintenanceInstance(
        maintenanceInstanceId,
        {
          from: date?.from,
          to: date?.to
        }
      ),
    enabled: !!maintenanceInstanceId && !!date?.from && !!date?.to
    // placeholderData: keepPreviousData // don't have 0 rows flash while changing pages/loading next page
  });

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setGlobalFilterValue('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  // Ações gerais (manter como antes)
  const handleEditMaterialDeficit = (materialdeficitId: number) => {
    console.log('Edit materialdeficit', materialdeficitId);
  };

  //Configurando açoes de colunas. Ações de colunas definidas no arquivo de colunas
  const columnActions = createActions(router); // Crie o objeto de ações, passando a função de navegação

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

      <TableTanstackFaceted
        data={deficits ?? []}
        columns={materialdeficitColumns(columnActions)}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
        // renderSubComponent={SubRowComponent}
        // getFacetedRowModel={getFacetedRowModel()}
        // getFacetedUniqueValues={getFacetedUniqueValues()}
        globalFilterFn='includesString'
        globalFilter={globalFilterValue}
        setGlobalFilter={setGlobalFilterValue}
      />
    </div>
  );
}
