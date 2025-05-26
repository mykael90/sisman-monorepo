'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';
import { IRoleList } from '../../role-types';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';

export interface RoleTableProps {
  data: IRoleList[]; // Nome da prop de dados ajustado para 'data'
  columnFilters: ColumnFiltersState;
  setColumnFilters?: Dispatch<SetStateAction<ColumnFiltersState>>;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>; // Tipo mais específico
  setSorting: Dispatch<SetStateAction<SortingState>>;
  sorting: SortingState;
  columns: ColumnDef<IRoleList, any>[]; // Tipo da coluna ajustado para IRoleList
}

export function RoleTable({
  data, // Usando 'data'
  columns,
  columnFilters,
  pagination,
  setPagination,
  setSorting,
  sorting
}: RoleTableProps) {
  return (
    <TableTanstack
      data={data} // Passa 'data' para TableTanstack
      columns={columns}
      columnFilters={columnFilters}
      pagination={pagination}
      setPagination={setPagination}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
}
