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
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input'; // Importe o tipo da Ref
import { IWorkerWithRelations } from '../../worker-types'; // Alterado para IWorkerWithRelations
import { useRouter } from 'next/navigation';
import { columns, createActions } from './worker-columns'; // Alterado para worker-columns
import { Wrench, UserPlus } from 'lucide-react'; // Alterado para Wrench (ícone de worker)
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';

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

  // --- Estado dos Filtros Movido para Cá ---
  const [workerValue, setWorkerValue] = useState(''); // Alterado para workerValue
  const [statusFilter, setStatusFilter] = useState(''); // Valor inicial ('', 'true', 'false')
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

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

  // --- Calcular columnFilters diretamente com base no estado local ---
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (workerValue) {
      // Alterado para workerValue
      filters.push({ id: 'name', value: workerValue }); // Alterado para workerValue
    }
    if (statusFilter) {
      // Só adiciona se statusFilter não for vazio
      // Ajuste o valor conforme esperado pela tabela ('true'/'false' string ou boolean)
      filters.push({ id: 'isActive', value: statusFilter === 'true' });
      // Ou: filters.push({ id: 'isActive', value: statusFilter });
    }
    return filters;
  }, [workerValue, statusFilter]); // Recalcula apenas quando workerValue ou statusFilter mudam // Alterado para workerValue

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setWorkerValue(''); // Alterado para setWorkerValue
    setStatusFilter('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

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
        <WorkerFilters // Alterado para WorkerFilters
          // Passa os valores e setters para o componente filho
          workerValue={workerValue} // Alterado para workerValue
          setWorkerValue={setWorkerValue} // Alterado para setWorkerValue
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClearFilters={handleClearFilters} // Passa a função de limpar
          inputDebounceRef={inputDebounceRef} // Passa a ref
        />
      </div>

      <TableTanstack
        data={workers} // Alterado para workers
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
