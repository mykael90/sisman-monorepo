'use client';

import React from 'react';
import { TableTanstack } from '../../../../../../components/table-tanstack/table-tanstack';
import { UsuarioTableProps } from './usuario-list';

export function UsuarioTable({
  usuarios,
  pagination,
  setPagination,
  setSorting,
  sorting,
  columns
}: UsuarioTableProps) {
  return (
    <TableTanstack
      data={usuarios}
      columns={columns}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
