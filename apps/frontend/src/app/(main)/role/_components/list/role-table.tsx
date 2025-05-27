'use client';

import React from 'react';
import { RoleTableProps } from './role-list';
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';

export function RoleTable({
  roles,
  columnFilters,
  pagination,
  setPagination,
  setSorting,
  sorting,
  columns
}: RoleTableProps) {
  return (
    <TableTanstack
      data={roles}
      columns={columns}
      columnFilters={columnFilters}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
