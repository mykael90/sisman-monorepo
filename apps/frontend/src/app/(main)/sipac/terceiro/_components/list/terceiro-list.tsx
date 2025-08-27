'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { SectionListHeader } from '../../../../../../components/section-list-header';
import {
  ColumnDef,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { UserCog } from 'lucide-react'; // TODO: Change icon to something more relevant for 'terceiro'
import { columns, createActions } from './terceiro-columns'; // Will create this file next
import { ITerceiro } from '../../terceiro-types';
import { TerceiroSearch } from './terceiro-search'; // Will create this file next
import { TerceiroTable } from './terceiro-table'; // Will create this file next

export function TerceiroList() {
  const router = useRouter();

  const [terceiros, setTerceiro] = useState<ITerceiro[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'nome-contratado', // Assuming 'nome-contratado' is a good default sort field
      desc: false
    }
  ]);

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Terceiros Contratados'
        subtitle='Recurso para gerenciar terceiros contratados no SISMAN'
        TitleIcon={UserCog}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <TerceiroSearch setTerceiro={setTerceiro} />
      </div>

      <TerceiroTable
        terceiros={terceiros}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
        columns={columns(columnActions)}
      />
    </div>
  );
}

export interface TerceiroTableProps {
  terceiros: ITerceiro[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<any>>;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  sorting: SortingState;
  columns: ColumnDef<ITerceiro, any>[];
}
