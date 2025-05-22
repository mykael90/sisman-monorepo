'use client';

import React from 'react';
import { UserTableProps } from './user-list';
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';

export function UserTable({
  users,
  columnFilters,
  pagination,
  setPagination,
  setSorting,
  sorting,
  columns
}: UserTableProps) {
  return (
    <TableTanstack
      data={users}
      columns={columns}
      columnFilters={columnFilters}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
