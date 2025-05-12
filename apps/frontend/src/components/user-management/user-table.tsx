'use client';

import React from 'react';
import { UserTableProps } from './user-management-page';
import { TableTanstack } from '../table-tanstack/table-tanstack';
import { actions, columns } from './user-columns';

export function UserTable({
  users,
  columnFilters,
  setColumnFilters,
  pagination,
  setPagination,
  setSorting,
  sorting
}: UserTableProps) {
  return (
    <TableTanstack
      data={users}
      columns={columns}
      actions={actions}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
