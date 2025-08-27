'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { SectionListHeader } from '../../../../../../components/section-list-header';
import {
  ColumnDef,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { columns, createActions } from './servidores-columns';
import { ServidoresTable } from './servidores-table';
import { IServidoresList } from '../../servidores-types';
import { ServidoresFilters } from './servidores-filters';

export function ServidoresList() {
  const router = useRouter();

  const [servidores, setServidores] = useState<IServidoresList[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name',
      desc: false
    }
  ]);

  const columnActions = createActions(router);

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Servidores da UFRN'
        subtitle='Recurso para importar servidor da UFRN para o cadastro no SISMAN'
        TitleIcon={UserCog}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <ServidoresFilters setServidores={setServidores} />
      </div>

      <ServidoresTable
        servidores={servidores}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
        columns={columns(columnActions)}
      />
    </div>
  );
}

export interface ServidoresTableProps {
  servidores: IServidoresList[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<any>>;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  sorting: SortingState;
  columns: ColumnDef<IServidoresList, any>[];
}
