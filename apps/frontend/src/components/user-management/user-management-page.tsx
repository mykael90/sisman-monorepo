'use client';

import React, { use, useState, useMemo, useRef } from 'react'; // Importe useMemo
import { UserManagementHeader } from './user-management-header';
import { UserFilters } from './user-filters';
import { UserTable } from './user-table';
// import initialUsers from './user-data-example'; // Removido se não usado
import { UserWithRoles1 } from '../../../types/user';
// import { getUsers } from '../../app/(main)/user-management/_actions'; // Removido se não usado
import {
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input'; // Importe o tipo da Ref

export function UserManagementPage({ dataPromise, refreshAction }) {
  const initialData: UserWithRoles1[] = use(dataPromise);

  const [users, setUsers] = useState(initialData); // Estado dos dados da tabela

  // --- Estado dos Filtros Movido para Cá ---
  const [userValue, setUserValue] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Valor inicial ('', 'true', 'false')
  const inputDebounceRef = useRef<InputDebounceRef>(null); // Cria a Ref

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10 //default page size
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'name',
      desc: false
    }
  ]); // can set initial sorting state here

  // --- Calcular columnFilters diretamente com base no estado local ---
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (userValue) {
      filters.push({ id: 'name', value: userValue });
    }
    if (statusFilter) {
      // Só adiciona se statusFilter não for vazio
      // Ajuste o valor conforme esperado pela tabela ('true'/'false' string ou boolean)
      filters.push({ id: 'isActive', value: statusFilter === 'true' });
      // Ou: filters.push({ id: 'isActive', value: statusFilter });
    }
    return filters;
  }, [userValue, statusFilter]); // Recalcula apenas quando userValue ou statusFilter mudam

  // Função para limpar filtros (agora pertence ao pai)
  const handleClearFilters = () => {
    setUserValue('');
    setStatusFilter('');
    // Chama o método clearInput exposto pelo filho via ref
    inputDebounceRef.current?.clearInput();
  };

  // Funções de exemplo (manter como antes)
  const handleAddUser = () => {
    console.log('Add new user');
  };
  const handleEditUser = (userId: number) => {
    console.log('Edit user', userId);
  };
  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <div className='container mx-auto p-4'>
      <UserManagementHeader onAddUser={handleAddUser} />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        {' '}
        {/* Ajuste altura se necessário */}
        <UserFilters
          // Passa os valores e setters para o componente filho
          userValue={userValue}
          setUserValue={setUserValue}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClearFilters={handleClearFilters} // Passa a função de limpar
          inputDebounceRef={inputDebounceRef} // Passa a ref
        />
      </div>

      <UserTable
        users={users} // Passa os dados (potencialmente já filtrados se a lógica for no backend)
        // Passa o estado calculado dos filtros para a tabela
        columnFilters={columnFilters}
        // A tabela PODE precisar de setColumnFilters se ela tiver sua própria lógica interna de filtro,
        // mas se a filtragem é feita aqui ou no backend, talvez não precise mais.
        // Se precisar, você teria que criar um setter aqui também.
        // setColumnFilters={setColumnFilters} // Removido ou ajustado conforme necessidade da tabela
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
}

export interface UserTableProps {
  users: UserWithRoles1[];
  columnFilters: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<any>>;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  sorting: SortingState;
}
