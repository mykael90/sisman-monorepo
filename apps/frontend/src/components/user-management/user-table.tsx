'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { User } from '@/types/user';

interface UserTableProps {
  users: User[];
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

// Componentes auxiliares para Badges (mantidos do original)
function RoleBadge({ role }: { role: string }) {
  const getColorByRole = () => {
    switch (role) {
      case 'Admin':
        return 'bg-blue-100 text-blue-800';
      case 'Editor':
        return 'bg-purple-100 text-purple-800';
      case 'Viewer':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${getColorByRole()}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        status === 'Active'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {status}
    </span>
  );
}

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<User>();

const columns = (
  onEdit: (userId: string) => void,
  onDelete: (userId: string) => void
) => [
  columnHelper.accessor('name', {
    header: 'User',
    cell: info => (
      // Mantém a estrutura original da célula User com Avatar
      <div className='flex items-center gap-2'>
        <Avatar className='h-12 w-12'>
          <AvatarImage
            src={info.row.original.avatar || '/placeholder.svg'}
            alt={info.getValue()}
          />
          <AvatarFallback>{info.getValue().charAt(0)}</AvatarFallback>
        </Avatar>
        <span>{info.getValue()}</span>
      </div>
    )
  }),
  columnHelper.accessor('username', {
    header: 'Username',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: info => <RoleBadge role={info.getValue()} /> // Usa o componente RoleBadge
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => <StatusBadge status={info.getValue()} /> // Usa o componente StatusBadge
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      // Mantém a estrutura original da célula Actions com botões
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onEdit(row.original.id)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onDelete(row.original.id)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      </div>
    )
  })
];

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  // 2. Instanciar a tabela com useReactTable
  const table = useReactTable({
    data: users,
    columns: columns(onEdit, onDelete), // Passa os callbacks para a definição das colunas
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className='border-md rounded-md'>
      <Table>
        <TableHeader className='bg-gray-100'>
          {/* 3. Renderizar cabeçalhos usando table.getHeaderGroups */}
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className='bg-white'>
          {/* 4. Renderizar linhas e células usando table.getRowModel e flexRender */}
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                // Aplica a classe específica apenas na célula 'name' para manter o layout do Avatar
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === 'name' ? 'flex items-center gap-2' : ''
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
