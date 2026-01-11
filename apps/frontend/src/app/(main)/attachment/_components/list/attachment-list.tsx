'use client';

import { useState } from 'react';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { IAttachment } from '../../attachment-types';
import {
  getAttachments,
  getRefreshedAttachments
} from '../../attachment-actions';
import { columns } from './attachment-columns';
import { SectionListHeader } from '@/components/section-list-header';
import { FileSearch } from 'lucide-react';
import { TableTanstack } from '@/components/table-tanstack/table-tanstack';
import { toast } from 'sonner';

export function AttachmentListPage({
  initialAttachments
}: {
  initialAttachments: IAttachment[];
}) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'created_at',
      desc: true
    }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const refreshAttachments = async () => {
    try {
      // Re-fetch data from the server
      await getRefreshedAttachments();
      const updatedAttachments = await getAttachments();
      setAttachments(updatedAttachments);
      toast.success('Lista de anexos atualizada.');
    } catch (error) {
      toast.error('Erro ao atualizar a lista de anexos.');
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Anexos'
        subtitle='Explore e gerencie todos os anexos do sistema'
        TitleIcon={FileSearch}
        refreshAction={refreshAttachments}
      />

      <div className='mt-4'>
        <TableTanstack
          data={attachments}
          columns={columns(refreshAttachments)}
          columnFilters={columnFilters}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
          sorting={sorting}
          setColumnFilters={setColumnFilters}
        />
      </div>
    </div>
  );
}
