'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, Warehouse, FilePlus } from 'lucide-react'; // Added Warehouse and FilePlus icons
import { SectionListHeader } from '../../../../../components/section-list-header';
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';
import { DefaultGlobalFilter } from '../../../../../components/table-tanstack/default-global-filter';
import { InputDebounceRef } from '../../../../../components/ui/input';
import { createActions, warehouseColumns } from './warehouse-columns'; // Updated import
import { IWarehouseList } from '../../warehouse-types';

interface WarehouseListPageProps {
  initialWarehouses: IWarehouseList[];
  refreshAction: () => Promise<void>;
}

export function WarehouseListPage({
  initialWarehouses,
  refreshAction
}: WarehouseListPageProps) {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState(initialWarehouses);

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
  const handleAddWarehouse = () => {
    router.push('warehouse/add');
  };
  const handleEditWarehouse = (warehouseId: number) => {
    console.log('Edit warehouse', warehouseId);
  };
  const handleDeleteWarehouse = (warehouseId: number) => {
    setWarehouses(
      warehouses.filter((warehouse) => warehouse.id !== warehouseId)
    );
  };

  //Configurando açoes de colunas. Ações de colunas definidas no arquivo de colunas
  const columnActions = createActions(router); // Crie o objeto de ações, passando a função de navegação

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Depósitos'
        subtitle='Sistema de gerenciamento de depósitos'
        TitleIcon={Warehouse}
        actionButton={{
          text: 'Cadastrar depósito',
          onClick: handleAddWarehouse,
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
          label={'Depósito'}
        />
      </div>

      <TableTanstack
        data={warehouses}
        columns={warehouseColumns(columnActions)}
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
