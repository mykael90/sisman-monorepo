'use client';

import {
  use,
  useState,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction
} from 'react'; // Importe useMemo
import { SectionListHeader } from '../../../../../components/section-list-header';
import { WorkerFilters } from './worker-filters'; // Alterado para WorkerFilters
import {
  ColumnDef,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input'; // Importe o tipo da Ref
import { IWorkerWithRelations } from '../../worker-types'; // Alterado para IWorkerWithRelations
import { useRouter } from 'next/navigation';
import {
  columns,
  createActions,
  defaultColumn,
  SubRowComponent
} from './worker-columns'; // Alterado para worker-columns
import { Wrench, UserPlus } from 'lucide-react'; // Alterado para Wrench (ícone de worker)
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';
import { TableTanstackFaceted } from '../../../../../components/table-tanstack/table-tanstack-faceted';
import { DefaultGlobalFilter } from '../../../../../components/table-tanstack/default-global-filter';

export function WorkerListPage({
  // Alterado para WorkerListPage
  initialWorkers, // Alterado para initialWorkers
  refreshAction
}: {
  initialWorkers: IWorkerWithRelations[]; // Alterado para IWorkerWithRelations
  refreshAction: () => void;
}) {
  const router = useRouter(); // Obtenha a função de navegação

  const [workers, setWorkers] = useState(initialWorkers); // Estado dos dados da tabela // Alterado para workers

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValue] = useState('');
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

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false
    }
  ]); // can set initial sorting state here

  // Ações gerais (manter como antes)
  const handleAddWorker = () => {
    // Alterado para handleAddWorker
    router.push('worker/add'); // Alterado para 'worker/add'
  };
  const handleEditWorker = (workerId: number) => {
    // Alterado para handleEditWorker, workerId
    console.log('Edit worker', workerId);
  };
  const handleDeleteWorker = (workerId: number) => {
    // Alterado para handleDeleteWorker, workerId
    setWorkers(workers.filter((worker) => worker.id !== workerId)); // Alterado para workers
  };

  //Configurando açoes de colunas. Ações de colunas definidas no arquivo de colunas
  const columnActions = createActions(router); // Crie o objeto de ações, passando a função de navegação

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Colaboradores' // Alterado para Trabalhadores
        subtitle='Sistema de gerenciamento de colaboradores e suas funções' // Alterado para trabalhadores
        TitleIcon={Wrench} // Alterado para Wrench
        actionButton={{
          text: 'Cadastrar trabalhador', // Alterado para trabalhador
          onClick: handleAddWorker, // Alterado para handleAddWorker
          variant: 'default',
          Icon: UserPlus
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

      <TableTanstackFaceted
        data={workers} // Alterado para workers
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
        defaultColumn={defaultColumn}
      />
    </div>
  );
}
