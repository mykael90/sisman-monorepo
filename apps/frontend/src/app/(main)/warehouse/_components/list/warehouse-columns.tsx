import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { IWarehouseList } from '../../warehouse-types';
import { DataTableColumnHeader } from '@/components/table-tanstack/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const columnHelper = createColumnHelper<IWarehouseList>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IWarehouseList> => ({
  onEdit: (row: Row<IWarehouseList>) => {
    if (row.original.id) {
      router.push(`warehouse/edit/${row.original.id}`);
    } else {
      console.error('Warehouse ID missing');
      throw new Error('Warehouse ID required for navigation');
    }
  },
  onDelete: (row: Row<IWarehouseList>) => {
    console.log('Delete warehouse', row.original);
    // Implementar lógica de deleção
  }
});

export const warehouseColumns = (
  configuredActions: ActionHandlers<IWarehouseList>
): ColumnDef<IWarehouseList, any>[] => [
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('code', {
    header: 'Código',
    cell: (props) => props.getValue() || '-'
  }),
  columnHelper.accessor('location', {
    header: 'Localização',
    cell: (props) => props.getValue() || '-'
  }),
  columnHelper.accessor('isActive', {
    header: 'Status',
    cell: (props) => (
      <StatusBadge status={`${props.getValue() ? 'Ativo' : 'Inativo'}`} />
    ),
    meta: {
      filterVariant: 'select'
    }
  }),
  {
    accessorKey: 'updatedAt',
    header: 'Última Atualização',
    cell: ({ row }) =>
      format(new Date(row.getValue('updatedAt')), 'PPp', {
        locale: ptBR
      })
  },
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
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      </div>
    )
  })
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        status === 'Ativo'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {status}
    </span>
  );
}
