'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useReducer, useRef, useState } from 'react';
import { PaginationState, SortingState } from '@tanstack/react-table';
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
import { listMaintenanceRequestDeficitPaginated } from '../../../../request/maintenance-request-actions';
import Loading from '../../../../../../../components/loading';

const queryClient = new QueryClient();

export function MaterialDeficitList() {
  const rerender = useReducer(() => ({}), {})[1];

  const router = useRouter();

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10 //default page size
  });

  const {
    data: listMaintenanceRequestDeficit,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['listMaintenanceRequestDeficit', pagination],
    queryFn: () => listMaintenanceRequestDeficitPaginated(pagination),
    placeholderData: keepPreviousData // don't have 0 rows flash while changing pages/loading next page
  });

  const defaultData = useMemo(() => [], []);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false
    }
  ]); // can set initial sorting state here

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
      {/* AQUI ESTÁ A MUDANÇA */}
      {isLoading ? (
        <Loading /> // Ou qualquer outro indicador de carregamento
      ) : (
        <TableTanstackFaceted
          data={listMaintenanceRequestDeficit?.data || defaultData}
          columns={materialdeficitColumns(columnActions)}
          pagination={pagination}
          setPagination={setPagination}
          rowCount={listMaintenanceRequestDeficit?.meta.total}
          setSorting={setSorting}
          sorting={sorting}
          globalFilterFn='includesString'
          globalFilter={globalFilterValue}
          setGlobalFilter={setGlobalFilterValue}
          manualPagination={true}
          autoResetPageIndex={false}
          debugTable={true}
        />
      )}
    </div>
  );
}
