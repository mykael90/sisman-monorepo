'use client';

import {
  Column,
  ColumnMeta,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  RowData
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

declare module '@tanstack/react-table' {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select' | 'selectBoolean';
  }
}

interface UserTableProps {
  users: UserWithRoles1[];
  onEdit: (userId: number | undefined) => void;
  onDelete: (userId: number | undefined) => void;
}

// 1. Definir as colunas com createColumnHelper
const columnHelper = createColumnHelper<UserWithRoles1>();

const columns = (
  onEdit: (userId: number | undefined) => void,
  onDelete: (userId: number | undefined) => void
) => [
  columnHelper.accessor('name', {
    header: 'User',
    cell: (props) => {
      const user = props.row.original; // Acesso ao objeto de dados completo da linha
      const nameValue = props.getValue(); // Valor da célula atual (user.name)
      const loginValue = user.login; // Acesso à propriedade 'login' da mesma linha

      return (
        <div className='flex items-center gap-2'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={user.image || '/placeholder.svg'}
              alt={loginValue ? `${nameValue} (${loginValue})` : nameValue} // Ex: "Nome (Login)"
            />
            <AvatarFallback>
              {/* Usa a inicial do nome, ou do login se o nome não existir, ou 'U' como padrão */}
              {/* usar como a primeira letra do primeiro nome do login e a primeira letra do segundo nome do login após o ponto, caso login não seja fornecido, utilize a primeira letra do nome e a primeira letra do ultimo nome separado por espaços              {nameValue
                ? nameValue.split(' ').map(part => part.charAt(0)).join('').toUpperCase()
                : loginValue ? loginValue.split('.').map(part => part.charAt(0)).join('').toUpperCase() : 'U'}
                 de nameValue */}
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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // 2. Instanciar a tabela com useReactTable
  const table = useReactTable({
    data: users,
    columns: columns(onEdit, onDelete), // Passa os callbacks para a definição das colunas
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    onColumnFiltersChange: setColumnFilters,
    filterFns: {},
    state: {
      columnFilters
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: false
  });

  return (
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
                  {header.column.getCanFilter() ? (
                    <div>
                      <Filter column={header.column} />
                    </div>
                  ) : null}
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

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  switch (filterVariant) {
    case 'range':
      return (
        <div>
          <div className='flex space-x-2'>
            {/* See faceted column filters example for min max values functionality */}
            <DebouncedInput
              type='number'
              value={(columnFilterValue as [number, number])?.[0] ?? ''}
              onChange={(value) =>
                column.setFilterValue((old: [number, number]) => [
                  value,
                  old?.[1]
                ])
              }
              placeholder={`Min`}
              className='w-24 rounded border shadow'
            />
            <DebouncedInput
              type='number'
              value={(columnFilterValue as [number, number])?.[1] ?? ''}
              onChange={(value) =>
                column.setFilterValue((old: [number, number]) => [
                  old?.[0],
                  value
                ])
              }
              placeholder={`Max`}
              className='w-24 rounded border shadow'
            />
          </div>
          <div className='h-1' />
        </div>
      );

    case 'selectBoolean':
      return (
        <select
          onChange={(e) => column.setFilterValue(e.target.value)}
          value={columnFilterValue?.toString()}
        >
          {/* See faceted column filters example for dynamic select options */}
          <option value=''>All</option>
          <option value='true'>true</option>
          <option value='false'>false</option>
        </select>
      );

    case 'select':
      return (
        <select
          onChange={(e) =>
            column.setFilterValue(
              e.target.value === ''
                ? ''
                : e.target.value === 'true'
                  ? true
                  : false
            )
          }
          value={columnFilterValue?.toString()}
        >
          {/* See faceted column filters example for dynamic select options */}
          <option value=''>All</option>
          <option value='true'>true</option>
          <option value='false'>false</option>
        </select>
      );

    //em outras palavras text
    default:
      return (
        <DebouncedInput
          className='w-36 rounded border shadow'
          onChange={(value) => column.setFilterValue(value)}
          placeholder={`Search...`}
          type='text'
          value={(columnFilterValue ?? '') as string}
        />
        // See faceted column filters example for datalist search suggestions
      );
  }
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
