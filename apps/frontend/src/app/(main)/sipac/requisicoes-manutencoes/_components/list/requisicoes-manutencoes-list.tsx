'use client';

import {
  use,
  useState,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction
} from 'react';
import { SectionListHeader } from '../../../../../../components/section-list-header';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { TableTanstack } from '../../../../../../components/table-tanstack/table-tanstack';
import { ISipacRequisicaoManutencaoWithRelations } from '../../requisicoes-manutencoes-types';
import { Wrench, PlusCircle } from 'lucide-react'; // Icone de chave inglesa para manutenção
import { RequisicoesManutencoesFilters } from './requisicoes-manutencoes-filters';
import { columns, createActions } from './requisicoes-manutencoes-columns';

export function RequisicoesManutencoesListPage({
  initialRequisicoesManutencao,
  refreshAction
}: {
  initialRequisicoesManutencao: ISipacRequisicaoManutencaoWithRelations[];
  refreshAction: () => void;
}) {
  const router = useRouter();

  const [requisicoesManutencao, setRequisicoesManutencao] = useState(
    initialRequisicoesManutencao
  );

  // --- Estado dos Filtros ---
  const [searchValue, setSearchValue] = useState(''); // Ex: para buscar por número/ano ou descrição
  const [statusFilter, setStatusFilter] = useState(''); // Ex: para filtrar por status da requisição
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'numeroRequisicao',
      desc: false
    }
  ]);

  // --- Calcular columnFilters diretamente com base no estado local ---
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (searchValue) {
      filters.push({ id: 'numeroRequisicao', value: searchValue }); // Ou outro campo relevante para busca
    }
    if (statusFilter && statusFilter !== 'all') {
      // Adiciona a condição para ignorar 'all'
      filters.push({ id: 'status', value: statusFilter }); // Supondo um campo 'status'
    }
    return filters;
  }, [searchValue, statusFilter]);

  // Função para limpar filtros
  const handleClearFilters = () => {
    setSearchValue('');
    setStatusFilter('all'); // Define para 'all' ao limpar
    inputDebounceRef.current?.clearInput();
  };

  // Ações gerais (adaptar para requisições de manutenção)
  const handleAddRequisicao = () => {
    router.push('requisicoes-manutencoes/add'); // Exemplo: rota para adicionar nova requisição
  };
  const handleEditRequisicao = (requisicaoId: number) => {
    console.log('Edit requisicao', requisicaoId);
    router.push(`requisicoes-manutencoes/edit/${requisicaoId}`); // Exemplo: rota para editar
  };
  const handleDeleteRequisicao = (requisicaoId: number) => {
    setRequisicoesManutencao(
      requisicoesManutencao.filter((req) => req.id !== requisicaoId)
    );
  };

  //Configurando açoes de colunas
  const columnActions = createActions(router);

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Requisições de Manutenção'
        subtitle='Sistema de gerenciamento de requisições de manutenção do SIPAC'
        TitleIcon={Wrench}
        actionButton={{
          text: 'Cadastrar Requisição',
          onClick: handleAddRequisicao,
          variant: 'default',
          Icon: PlusCircle
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <RequisicoesManutencoesFilters
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClearFilters={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
        />
      </div>

      <TableTanstack
        data={requisicoesManutencao}
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
