import { ColumnDef } from '@tanstack/react-table';
import { IMaintenanceRequestWithRelations } from '../../request-types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// TODO: Replace with actual DataTableColumnHeader component path
const DataTableColumnHeader = ({
  column,
  title
}: {
  column: any;
  title: string;
}) => <div>{title}</div>;

export const columns: ColumnDef<IMaintenanceRequestWithRelations>[] = [
  {
    accessorKey: 'protocolNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Protocolo' />
    ),
    cell: ({ row }) => (
      <div className='w-[120px]'>{row.getValue('protocolNumber')}</div>
    )
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Título' />
    ),
    cell: ({ row }) => (
      <div className='min-w-[200px]'>{row.getValue('title')}</div>
    )
  },
  {
    accessorKey: 'requestedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data de Abertura' />
    ),
    cell: ({ row }) => {
      const requestedAt = row.original.requestedAt;
      return (
        <div className='w-[120px]'>
          {requestedAt
            ? format(new Date(requestedAt), 'dd/MM/yyyy', { locale: ptBR })
            : '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'deadline',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Prazo' />
    ),
    cell: ({ row }) => {
      const deadline = row.original.deadline;
      return (
        <div className='w-[120px]'>
          {deadline
            ? format(new Date(deadline), 'dd/MM/yyyy', { locale: ptBR })
            : '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'currentMaintenanceInstance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Instância' />
    ),
    cell: ({ row }) => (
      <div className='min-w-[150px]'>
        {row.original.currentMaintenanceInstance?.name || '-'}
      </div>
    )
  },
  {
    accessorKey: 'assignedTo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Responsável' />
    ),
    cell: ({ row }) => (
      <div className='min-w-[150px]'>
        {row.original.assignedTo?.name || '-'}
      </div>
    )
  }
];
