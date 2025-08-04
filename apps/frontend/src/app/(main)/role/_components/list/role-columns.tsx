import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { RoleBase } from '@sisman/types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { format } from 'date-fns'; // Assuming date-fns is available for date formatting
import { ptBR } from 'date-fns/locale'; // Assuming ptBR locale

const columnHelper = createColumnHelper<RoleBase>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<RoleBase> => ({
  onEdit: (row: Row<RoleBase>) => {
    console.log('Edit role', row.original);
    if (row.original.id) {
      router.push(`role/edit/${row.original.id}`);
    } else {
      console.error('Role ID is missing, cannot navigate to edit page.');
      throw new Error('Role ID is missing, cannot navigate to edit page.');
    }
  },
  onDelete: (row: Row<RoleBase>) => {
    console.log('Delete role', row.original);
    // Implement delete logic here (e.g., confirmation modal, API call)
    // You might need to pass a delete function down from the list page
  }
});

export const columns = (
  configuredActions: ActionHandlers<RoleBase>
): ColumnDef<RoleBase, any>[] => [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (props) => props.getValue(),
    enableSorting: true,
    meta: {
      filterVariant: 'number' // Assuming ID is a number and filterable
    }
  }),
  columnHelper.accessor('role', {
    header: 'Papel',
    cell: (props) => props.getValue(),
    enableSorting: true,
    meta: {
      filterVariant: 'text' // Assuming role name is filterable by text
    }
  }),
  columnHelper.accessor('description', {
    header: 'Descrição',
    cell: (props) =>
      props.getValue() || (
        <span className='text-slate-400 italic'>Sem descrição</span>
      ),
    enableSorting: true,
    meta: {
      filterVariant: 'text' // Assuming description is filterable by text
    }
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Última Atualização',
    cell: (props) => {
      const date = props.getValue();
      // Format date if it's a valid Date object or string
      try {
        return date
          ? format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
          : '-';
      } catch (e) {
        console.error('Failed to format date:', date, e);
        return date ? String(date) : '-'; // Fallback to string or '-'
      }
    },
    enableSorting: true,
    meta: {
      filterVariant: 'date' // If you implement date filtering
    }
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
        {/* Delete button - requires implementation */}
        {/* <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button> */}
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false
  })
];
