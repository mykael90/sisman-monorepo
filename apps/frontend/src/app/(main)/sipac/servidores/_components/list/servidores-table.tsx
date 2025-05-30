'use client';

import React from 'react';
import { TableTanstack } from '../../../../../../components/table-tanstack/table-tanstack';
import { ServidoresTableProps } from './servidores-list';

export function ServidoresTable({
  servidores,
  pagination,
  setPagination,
  setSorting,
  sorting,
  columns
}: ServidoresTableProps) {
  return (
    <TableTanstack
      data={servidores}
      columns={columns}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
