import { ColumnDef } from '@tanstack/react-table';
import { IPickingOrderWithRelations } from '../../picking-order-types';
import { DefaultRowAction } from '../../../../../../../components/table-tanstack/default-row-action';
import { DataTableColumnHeader } from '../../../../../../../components/table-tanstack/data-table-column-header';
import { useRouter } from 'next/navigation'; // Importar useRouter

export const columns = (
  router: ReturnType<typeof useRouter>
): ColumnDef<IPickingOrderWithRelations>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => <div>{row.getValue('status')}</div>
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data de Criação' />
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue('createdAt')).toLocaleDateString()}</div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DefaultRowAction
        row={row}
        configuredActions={{
          onEdit: (row) => router.push(`picking-order/edit/${row.original.id}`),
          onView: (row) => router.push(`picking-order/${row.original.id}`)
        }}
      />
    )
  }
];

export const createActions = (router: ReturnType<typeof useRouter>) => {
  return {}; // Ações específicas podem ser adicionadas aqui se necessário
};

export function SubRowComponent({ row }: { row: any }) {
  return (
    <div className='p-4'>
      <p>Detalhes da Ordem de Picking: {row.original.id}</p>
      {/* Adicione mais detalhes aqui conforme necessário */}
    </div>
  );
}
