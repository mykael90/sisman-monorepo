'use client';

import { columns, createActions } from './maintenance-instance-columns';
import { IMaintenanceInstance } from '../../instance-types';
import { Button } from '@/components/ui/button';
import { Construction, FilePlus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionListHeader } from '../../../../../../components/section-list-header';
import { useRef, useState } from 'react';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { TableTanstack } from '../../../../../../components/table-tanstack/table-tanstack';
import { DefaultGlobalFilter } from '../../../../../../components/table-tanstack/default-global-filter';
import { InputDebounceRef } from '../../../../../../components/ui/input';

interface Props {
  initialInstances: IMaintenanceInstance[];
  refreshAction: () => Promise<boolean>;
}

export function MaintenanceInstanceListPage({
  initialInstances,
  refreshAction
}: Props) {
  const router = useRouter();

  const [instances, setInstances] = useState(initialInstances); // Estado dos dados da tabela

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
      id: 'name',
      desc: false
    }
  ]); // can set initial sorting state here

  const handleRefresh = async () => {
    await refreshAction();
    router.refresh();
  };

  // Ações gerais (manter como antes)
  const handleAddMaintenanceInstance = () => {
    router.push('instance/add');
  };
  const handleEditMaintenanceInstance = (maintenanceInstanceId: number) => {
    console.log('Edit maintenanceInstance', maintenanceInstanceId);
  };
  const handleDeleteMaintenanceInstance = (maintenanceInstanceId: number) => {
    setInstances(
      instances.filter(
        (maintenanceInstance) =>
          maintenanceInstance.id !== maintenanceInstanceId
      )
    );
  };

  //Configurando açoes de colunas. Ações de colunas definidas no arquivo de colunas
  const columnActions = createActions(router); // Crie o objeto de ações, passando a função de navegação

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Instâncias de Manutenção'
        subtitle='Sistema de gerenciamento de instâncias de manutenção'
        TitleIcon={Construction}
        actionButton={{
          text: 'Cadastrar instância',
          onClick: handleAddMaintenanceInstance,
          variant: 'default',
          Icon: FilePlus
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
          label={'Instância de Manutenção'}
        />
      </div>

      <TableTanstack
        data={instances}
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
