import { ColumnDef } from '@tanstack/react-table';
import { IWarehouseList } from '../../warehouse-types';
import { DataTableColumnHeader } from '@/components/table-tanstack/data-table-column-header';

export const warehouseColumns: ColumnDef<IWarehouseList>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nome' />
    ),
    cell: ({ row }) => <div className='w-[180px]'>{row.getValue('name')}</div>,
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => (
      <div className='w-[100px]'>{row.getValue('code') || '-'}</div>
    ),
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Localização' />
    ),
    cell: ({ row }) => (
      <div className='w-[200px]'>{row.getValue('location') || '-'}</div>
    ),
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ativo' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px]'>{row.getValue('isActive') ? 'Sim' : 'Não'}</div>
    ),
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Última Atualização' />
    ),
    cell: ({ row }) => (
      <div className='w-[180px]'>
        {new Date(row.getValue('updatedAt')).toLocaleDateString()}
      </div>
    ),
    enableSorting: true,
    enableHiding: true
  }
];
