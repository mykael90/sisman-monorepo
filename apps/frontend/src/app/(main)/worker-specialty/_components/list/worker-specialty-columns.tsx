import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { IWorkerSpecialty } from '../../worker-specialty-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const columnHelper = createColumnHelper<IWorkerSpecialty>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IWorkerSpecialty> => ({
  onEdit: (row: Row<IWorkerSpecialty>) => {
    if (row.original.id) {
      router.push(`worker-specialty/edit/${row.original.id}`);
    } else {
      console.error(
        'WorkerSpecialty ID is missing, cannot navigate to edit page.'
      );
      throw new Error(
        'WorkerSpecialty ID is missing, cannot navigate to edit page.'
      );
    }
  },
  onDelete: (row: Row<IWorkerSpecialty>) => {
    console.log('Delete worker specialty', row.original);
    // Implement delete logic here
  }
});

export const columns = (
  configuredActions: ActionHandlers<IWorkerSpecialty>
): ColumnDef<IWorkerSpecialty, any>[] => [
  // columnHelper.accessor('id', {
  //   header: 'ID',
  //   cell: (props) => props.getValue(),
  //   enableSorting: true
  // }),
  columnHelper.accessor('name', {
    header: 'Especialidade',
    size: 50,
    enableResizing: false,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    cell: (props) =>
      props.getValue() || (
        <span className='text-slate-400 italic'>Sem descrição</span>
      )
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Última Atualização',
    cell: (props) => {
      const date = props.getValue();
      try {
        return date
          ? format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
          : '-';
      } catch (e) {
        console.error('Failed to format date:', date, e);
        return date ? String(date) : '-';
      }
    },
    enableSorting: true
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit(row)}
        >
          <Edit className='h-4 w-4' />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false
  })
];
