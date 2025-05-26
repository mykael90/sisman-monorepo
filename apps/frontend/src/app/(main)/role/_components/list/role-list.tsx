'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  ColumnDef
} from '@tanstack/react-table';

import { IRoleList } from '../../role-types';
import { InputDebounceRef } from '@/components/ui/input';

// Componentes que precisarão ser criados/adaptados para Role:
import { RoleListHeader } from './role-list-header'; // Similar a UserListHeader
import { RoleFilters } from './role-filters'; // Similar a UserFilters
import { RoleTable } from './role-table'; // Similar a UserTable
import {
  columns as defineRoleColumns,
  createActions as createRoleActions
} from './role-columns'; // Similar a user-columns

export interface RoleListPageProps {
  initialRoles: IRoleList[];
  refreshAction: () => Promise<void>; // Ou void, dependendo da sua implementação
}

export function RoleListPage({
  initialRoles,
  refreshAction
}: RoleListPageProps) {
  const router = useRouter();

  const [roles, setRoles] = useState<IRoleList[]>(initialRoles);

  // Estados para filtros, paginação e ordenação
  const [roleNameFilter, setRoleNameFilter] = useState(''); // Exemplo de filtro específico para nome do papel
  // Adicione outros estados de filtro conforme necessário (ex: descriptionFilter)
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'role', // Campo padrão para ordenação
      desc: false
    }
  ]);

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (roleNameFilter) {
      filters.push({ id: 'role', value: roleNameFilter }); // Filtro pelo nome do papel
    }
    // Adicione lógica para outros filtros
    return filters;
  }, [roleNameFilter /*, outros estados de filtro */]);

  const handleClearFilters = () => {
    setRoleNameFilter('');
    // Limpe outros estados de filtro
    inputDebounceRef.current?.clearInput(); // Se estiver usando InputDebounce
    // Chamar refreshAction se a limpeza de filtros deve buscar dados novamente
    // refreshAction();
  };

  const handleAddRole = () => {
    router.push('/role/add'); // Ajuste a rota conforme necessário
  };

  // Ações específicas para as colunas de Role
  const columnActions = useMemo(() => createRoleActions(router), [router]);
  const tableColumns = useMemo(
    () => defineRoleColumns(columnActions),
    [columnActions]
  );

  return (
    <div className='container mx-auto p-4'>
      <RoleListHeader onAddRole={handleAddRole} />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <RoleFilters
          roleNameFilter={roleNameFilter}
          setRoleNameFilter={setRoleNameFilter}
          // Passe outros filtros e setters
          onClearFilters={handleClearFilters}
          inputDebounceRef={inputDebounceRef} // Se aplicável
        />
      </div>

      <RoleTable
        data={roles} // Os dados a serem exibidos
        columns={tableColumns}
        columnFilters={columnFilters}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        // setColumnFilters não é necessário se os filtros são gerenciados aqui
      />
    </div>
  );
}
