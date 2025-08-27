'use client';

import React from 'react';
import { TableTanstack } from '../../../../../../components/table-tanstack/table-tanstack';
import { TerceiroTableProps } from './terceiro-list';

export function TerceiroTable({
  terceiros,
  pagination,
  setPagination,
  setSorting,
  sorting,
  columns
}: TerceiroTableProps) {
  return (
    <TableTanstack
      data={terceiros}
      columns={columns}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
