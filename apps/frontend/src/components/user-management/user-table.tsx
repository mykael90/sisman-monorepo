'use client';

import React from 'react';
import { UserTableProps } from './user-management-page';
import { TableTanstack } from '../table-tanstack/table-tanstack';
import { actions, columns } from './user-columns';

export function UserTable({
  users,
  columnFilters,
  pagination,
  setPagination,
  setSorting,
  sorting
}: UserTableProps) {
  return (
    <TableTanstack
      data={users}
      columns={columns(actions)}
      columnFilters={columnFilters}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
