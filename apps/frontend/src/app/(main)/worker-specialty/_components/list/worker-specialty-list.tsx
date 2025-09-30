'use client';

import React, { useRef, useState } from 'react';
import { IWorkerSpecialtyWithRelations } from '../../worker-specialty-types';
import { CirclePlus, KeyRound, PlusCircle } from 'lucide-react';
import { columns, createActions } from './worker-specialty-columns'; // Será criado em seguida
import { InputDebounceRef } from '../../../../../components/ui/input';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';
import { SectionListHeader } from '../../../../../components/section-list-header';
import { DefaultGlobalFilter } from '../../../../../components/table-tanstack/default-global-filter';

interface WorkerSpecialtyListPageProps {
  initialWorkerSpecialties: IWorkerSpecialtyWithRelations[];
  refreshAction: () => Promise<true | null | void>;
}

export function WorkerSpecialtyListPage({
  initialWorkerSpecialties,
  refreshAction
}: WorkerSpecialtyListPageProps) {
  const router = useRouter();

  const [workerSpecialties, setWorkerSpecialties] = useState(
    initialWorkerSpecialties
  );

  // --- Estado dos Filtros Movido para Cá ---
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setGlobalFilterValue('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10 //default page size
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'name', // Default sort by workerspecialties name
      desc: false
    }
  ]);

  // General Actions
  const handleAddWorkerSpecialty = () => {
    router.push('worker-specialty/add');
  };

  // Note: Delete action needs implementation (e.g., modal)
  // const handleDeleteWorkerSpecialties = (workerspecialtiesId: number) => {
  //   setWorkerSpecialtiess(workerspecialtiess.filter((workerspecialties) => workerspecialties.id !== workerspecialtiesId)); // Example optimistic update
  //   // Call server action to delete
  // };

  // Configure column actions
  const columnActions = createActions(router); // Pass the navigation function

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Especialidades'
        subtitle='Sistema de gerenciamento de especialidades'
        TitleIcon={KeyRound} // Using KeyRound for WorkerSpecialty list header
        actionButton={{
          text: 'Cadastrar Especialidade',
          onClick: handleAddWorkerSpecialty,
          variant: 'default',
          Icon: CirclePlus // Using CirclePlus for Add WorkerSpecialty button
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        {' '}
        {/* Ajuste altura se necessário */}
        <DefaultGlobalFilter
          // Passa os valores e setters para o componente
          globalFilterValue={globalFilterValue}
          setGlobalFilterValue={setGlobalFilterValue}
          onClearFilter={handleClearFilters} // Passa a função de limpar
          inputDebounceRef={inputDebounceRef} // Passa a ref
          label={'Especialidade'}
        />
      </div>

      <TableTanstack
        data={workerSpecialties}
        columns={columns(columnActions)}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
        globalFilterFn='includesString'
        globalFilter={globalFilterValue}
        setGlobalFilter={setGlobalFilterValue}
      />
    </div>
  );
}
