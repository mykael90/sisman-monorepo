'use client';

import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { ISurveyWithRelations } from '../../survey-types';
import { Button } from '@/components/ui/button';
import { ClipboardList, Edit, Megaphone, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { deleteSurvey } from '../../survey-actions';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<ISurveyWithRelations>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance,
  onDeleteSuccess: (id: string) => void
): ActionHandlers<ISurveyWithRelations> => ({
  onEdit: (row: Row<ISurveyWithRelations>) => {
    if (row.original.id) {
      router.push(`survey/edit/${row.original.id}`);
    } else {
      console.error('Survey ID missing');
      throw new Error('Survey ID required for navigation');
    }
  },
  onStats: (row: Row<ISurveyWithRelations>) => {
    if (row.original.id) {
      router.push(`survey/stats/${row.original.id}`);
    } else {
      console.error('Survey ID missing');
      throw new Error('Survey ID required for navigation');
    }
  },
  onResponse: (row: Row<ISurveyWithRelations>) => {
    if (row.original.id) {
      router.push(`survey-response/${row.original.id}`);
    } else {
      console.error('Survey ID missing');
      throw new Error('Survey ID required for navigation');
    }
  },
  onDelete: async (row: Row<ISurveyWithRelations>) => {
    try {
      await deleteSurvey(row.original.id);
      toast.success('Pesquisa deletada com sucesso!');
      onDeleteSuccess(row.original.id);
    } catch (error) {
      toast.error('Erro ao deletar pesquisa.');
    }
  }
});

export const columns = (
  configuredActions: ActionHandlers<ISurveyWithRelations>
): ColumnDef<ISurveyWithRelations, any>[] => [
  columnHelper.accessor('title', {
    header: 'Título',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    size: 700,
    cell: (props) => <div className='whitespace-normal'>{props.getValue()}</div>
  }),
  columnHelper.accessor('uniqueAnswerByUser', {
    header: 'Resposta Única',
    cell: (props) => (props.getValue() ? 'Sim' : 'Não')
  }),
  // {
  //   accessorKey: 'createdAt',
  //   header: 'Criado em',
  //   cell: ({ row }) =>
  //     format(new Date(row.getValue('createdAt')), 'PPp', {
  //       locale: ptBR
  //     })
  // },
  columnHelper.accessor((row) => row.responses.length, {
    header: 'Nº Respostas',
    cell: (props) => <div className='text-center'>{props.getValue()}</div>
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        {/* <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit(row)}
          title='Editar'
        >
          <Edit className='h-4 w-4' />
        </Button> */}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onResponse(row)}
          title='Responder'
        >
          <Megaphone className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onStats(row)}
          title='Estatísticas'
        >
          <ClipboardList className='h-4 w-4' />
        </Button>
        {/* <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button> */}
      </div>
    )
  })
];
