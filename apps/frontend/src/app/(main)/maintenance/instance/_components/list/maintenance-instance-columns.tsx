import { ColumnDef } from '@tanstack/react-table';
import { MaintenanceInstanceList } from '../../maintenance-instance-types';
import { DataTableColumnHeader } from '@/components/table-tanstack/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActionsDropdown } from './actions-dropdown';

export const columns: ColumnDef<MaintenanceInstanceList>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nome' />
    )
  },
  {
    accessorKey: 'sipacId',
    header: 'ID SIPAC'
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
        {row.getValue('isActive') ? 'Ativo' : 'Inativo'}
      </Badge>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    cell: ({ row }) =>
      format(new Date(row.getValue('createdAt')), 'PPp', {
        locale: ptBR
      })
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsDropdown instance={row.original} />
  }
];
