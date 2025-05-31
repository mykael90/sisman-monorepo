'use client';

import {
  use,
  useState,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction
} from 'react'; // Importe useMemo
import { SectionListHeader } from '../../../../../../components/section-list-header';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input'; // Importe o tipo da Ref
import { useRouter } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { columns, createActions } from './servidores-columns';
import { ServidoresTable } from './servidores-table';
import { IServidoresList } from '../../servidores-types';
import { ServidoresFilters } from './servidores-filters';

export function ServidoresListPage(
  {
    // dataPromise
    //   refreshAction
  }: {
    // dataPromise: Promise<IServidoresList[]>;
    //   refreshAction: () => void;
  }
) {
  const router = useRouter(); // Obtenha a função de navegação

  const [servidores, setServidores] = useState<IServidoresList[]>([]);

  //   const servidores: IServidoresList[] = use(dataPromise);

  // --- Estado dos Filtros Movido para Cá ---
  const [nomeValue, setNomeValue] = useState('');
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
    if (nomeValue) {
      filters.push({ id: 'name', value: nomeValue });
    }
    if (statusFilter) {
      // Só adiciona se statusFilter não for vazio
      // Ajuste o valor conforme esperado pela tabela ('true'/'false' string ou boolean)
      filters.push({ id: 'isActive', value: statusFilter === 'true' });
      // Ou: filters.push({ id: 'isActive', value: statusFilter });
    }
    return filters;
  }, [nomeValue, statusFilter]); // Recalcula apenas quando servidorValue ou statusFilter mudam

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setNomeValue('');
    setStatusFilter('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  // Ações gerais (manter como antes)
  const handleAddServidores = () => {
    router.push('servidor/add');
  };
  // const handleEditServidores = (servidorId: number) => {
  //   console.log('Edit servidor', servidorId);
  // };

  //Configurando açoes de colunas. Ações de colunas definidas no arquivo de colunas
  const columnActions = createActions(router); // Crie o objeto de ações, passando a função de navegação

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Servidores da UFRN'
        subtitle='Recurso para importar servidor da UFRN para o cadastro no SISMAN'
        TitleIcon={UserCog}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        {' '}
        {/* Ajuste altura se necessário */}
        <ServidoresFilters
          // Passa os valores e setters para o componente filho
          setServidores={setServidores}
          onClearFilters={handleClearFilters} // Passa a função de limpar
        />
      </div>

      {!!servidores.length && (
        <ServidoresTable
          servidores={servidores} // Passa os dados (potencialmente já filtrados se a lógica for no backend)
          // Passa o estado calculado dos filtros para a tabela
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
          columns={columns(columnActions)}
        />
      )}
    </div>
  );
}

export interface ServidoresTableProps {
  servidores: IServidoresList[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<any>>;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  sorting: SortingState;
  columns: ColumnDef<IServidoresList, any>[];
}
