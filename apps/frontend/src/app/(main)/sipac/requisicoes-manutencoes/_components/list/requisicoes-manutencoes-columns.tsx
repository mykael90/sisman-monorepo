'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ISipacRequisicaoManutencaoWithRelations } from '../../requisicoes-manutencoes-types';
import { DataTableColumnHeader } from '../../../../../../components/table-tanstack/data-table-column-header';
import { DefaultRowAction } from '../../../../../../components/table-tanstack/default-row-action';
import { useRouter } from 'next/navigation'; // Importe useRouter para tipagem
import { Row } from '@tanstack/react-table'; // Importe Row para tipagem

// Definição das ações que podem ser passadas para as colunas
export interface RequisicaoManutencaoColumnActions {
  onEdit: (row: Row<ISipacRequisicaoManutencaoWithRelations>) => void;
  onDelete: (row: Row<ISipacRequisicaoManutencaoWithRelations>) => void;
  onView: (row: Row<ISipacRequisicaoManutencaoWithRelations>) => void; // Adicionando ação de visualização
}

export const columns = (
  actions: RequisicaoManutencaoColumnActions
): ColumnDef<ISipacRequisicaoManutencaoWithRelations>[] => [
  {
    accessorKey: 'numeroRequisicao',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Requisição' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px]'>{row.getValue('numeroRequisicao')}</div>
    ),
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'descricao',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descrição' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] truncate font-medium'>
            {row.getValue('descricao')}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{row.getValue('status')}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DefaultRowAction
        row={row}
        configuredActions={{
          onEdit: actions.onEdit,
          onDelete: actions.onDelete,
          onView: actions.onView
        }}
      />
    )
  }
];

// Função para criar as ações, recebendo o router
export const createActions = (
  router: any
): RequisicaoManutencaoColumnActions => {
  return {
    onEdit: (row: Row<ISipacRequisicaoManutencaoWithRelations>) => {
      router.push(`requisicoes-manutencoes/edit/${row.original.id}`);
    },
    onDelete: (row: Row<ISipacRequisicaoManutencaoWithRelations>) => {
      // Lógica para deletar (pode ser um modal de confirmação, etc.)
      console.log('Deletar requisição:', row.original.id);
    },
    onView: (row: Row<ISipacRequisicaoManutencaoWithRelations>) => {
      router.push(`requisicoes-manutencoes/view/${row.original.id}`);
    }
  };
};
