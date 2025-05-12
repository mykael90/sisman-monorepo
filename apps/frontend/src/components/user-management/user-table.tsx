'use client';

import {
  Column,
  ColumnMeta,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  RowData,
  getPaginationRowModel,
  getSortedRowModel
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
import type { UserWithRoles1 } from '@/types/user';
import React from 'react';
import { UserPagination } from './user-pagination';
import { UserTableProps } from './user-management-page';

declare module '@tanstack/react-table' {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select' | 'selectBoolean';
  }
}

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<UserWithRoles1>();

const columns = (
  onEdit: (userId: number | undefined) => void,
  onDelete: (userId: number | undefined) => void
) => [
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: (props) => {
      const user = props.row.original; // Acesso ao objeto de dados completo da linha
      const nameValue = props.getValue(); // Valor da célula atual (user.name)
      const loginValue = user.login; // Acesso à propriedade 'login' da mesma linha

      return (
        <div className='flex items-center gap-2'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={user.image}
              alt={loginValue ? `${nameValue} (${loginValue})` : nameValue} // Ex: "Nome (Login)"
            />
            <AvatarFallback>
              {getAvatarInitials(loginValue, nameValue)}
            </AvatarFallback>
          </Avatar>
          <span>{nameValue}</span>
        </div>
      );
    }
  }),
  columnHelper.accessor('login', {
    header: 'Login',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (props) => props.getValue()
  }),
  // columnHelper.accessor('role', {
  //   header: 'Role',
  //   cell: props => <RoleBadge role={props.getValue()} /> // Usa o componente RoleBadge
  // }),
  columnHelper.accessor('isActive', {
    header: 'Status',
    cell: (props) => <StatusBadge status={`${props.getValue()}`} />, // Usa o componente StatusBadge
    meta: {
      filterVariant: 'select'
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
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

export function UserTable({
  users,
  onEdit,
  onDelete,
  columnFilters,
  setColumnFilters,
  pagination,
  setPagination,
  setSorting,
  sorting
}: UserTableProps) {
  // 2. Instanciar a tabela com useReactTable
  const table = useReactTable({
    data: users,
    columns: columns(onEdit, onDelete), // Passa os callbacks para a definição das colunas
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    filterFns: {},
    state: {
      columnFilters,
      sorting,
      pagination
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: false
  });

  return (
    <div>
      <div className='border-md rounded-md'>
        <Table>
          <TableHeader className='bg-gray-100'>
            {/* 3. Renderizar cabeçalhos usando table.getHeaderGroups */}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {/* {header.column.getCanFilter() ? (
                      <div>
                        <Filter column={header.column} />
                      </div>
                    ) : null} */}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='bg-white'>
            {/* 4. Renderizar linhas e células usando table.getRowModel e flexRender */}
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  // Aplica a classe específica apenas na célula 'name' para manter o layout do Avatar
                  <TableCell
                    key={cell.id}
                    className={`${cell.column.id === 'name' ? 'flex items-center gap-2' : ''} py-2.5`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='mt-1 h-14 rounded-b-md border-0 bg-white px-4 py-3.5'>
        <UserPagination table={table} />
      </div>
    </div>
  );
}

function getAvatarInitials(
  login: string | undefined,
  name: string | undefined
): string {
  if (login) {
    const initialsFromLogin = login
      .split('.')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

    if (initialsFromLogin.length === 1) {
      return initialsFromLogin.charAt(0);
    }

    return initialsFromLogin.charAt(0) + initialsFromLogin.charAt(1);
  } else if (name) {
    const initialsFromName = name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

    if (initialsFromName.length === 1) {
      return initialsFromName.charAt(0);
    }

    return (
      initialsFromName.charAt(0) +
      initialsFromName.charAt(initialsFromName.length - 1)
    );
  } else return 'U';
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
