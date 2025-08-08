'use client';

import { useState, useMemo, useRef, Dispatch, SetStateAction } from 'react';
import { SectionListHeader } from '../../../../../components/section-list-header';
import { RoleFilters } from './role-filters';
import { RoleTable } from './role-table';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState
} from '@tanstack/react-table';
import { InputDebounceRef } from '@/components/ui/input';
import { IRole } from '../../role-types';
import { useRouter } from 'next/navigation';
import { columns, createActions } from './role-columns';
import { KeyRound, CirclePlus } from 'lucide-react'; // Using KeyRound for Role list header
import { TableTanstack } from '../../../../../components/table-tanstack/table-tanstack';

export function RoleListPage({
  initialRoles,
  refreshAction
}: {
  initialRoles: IRole[];
  refreshAction: () => void;
}) {
  const router = useRouter();

  const [roles, setRoles] = useState(initialRoles); // State for table data

  // --- Filter State ---
  const [roleValue, setRoleValue] = useState(''); // For searching role name or description
  const inputDebounceRef = useRef<InputDebounceRef>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'role', // Default sort by role name
      desc: false
    }
  ]);

  // --- Calculate columnFilters ---
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (roleValue) {
      // Assuming search applies to both role name and description
      // TanStack Table's default filtering might handle this if you configure it
      // or you might need a custom filter function.
      // For simplicity, let's assume a global filter or filter on 'role' for now.
      // A more advanced approach would involve a custom filterFn in column definition
      // or filtering the 'roles' state array directly based on roleValue.
      // Let's apply it to the 'role' column for now.
      filters.push({ id: 'role', value: roleValue });
      // If you want to filter by description too, you'd need another filter object
      // or a custom global filter logic in the table component.
      // filters.push({ id: 'description', value: roleValue }); // Example for description filter
    }
    // No status filter for roles based on IRole
    return filters;
  }, [roleValue]); // Recalculate only when roleValue changes

  // Function to clear filters
  const handleClearFilters = () => {
    setRoleValue('');
    inputDebounceRef.current?.clearInput();
  };

  // General Actions
  const handleAddRole = () => {
    router.push('role/add');
  };

  // Note: Delete action needs implementation (e.g., modal)
  // const handleDeleteRole = (roleId: number) => {
  //   setRoles(roles.filter((role) => role.id !== roleId)); // Example optimistic update
  //   // Call server action to delete
  // };

  // Configure column actions
  const columnActions = createActions(router); // Pass the navigation function

  return (
    <div className='container mx-auto p-4'>
      <SectionListHeader
        title='Gerenciamento de Papéis'
        subtitle='Sistema de gerenciamento de papéis (roles) e suas permissões'
        TitleIcon={KeyRound} // Using KeyRound for Role list header
        actionButton={{
          text: 'Cadastrar Papel',
          onClick: handleAddRole,
          variant: 'default',
          Icon: CirclePlus // Using CirclePlus for Add Role button
        }}
      />

      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <RoleFilters
          roleValue={roleValue}
          setRoleValue={setRoleValue}
          onClearFilters={handleClearFilters}
          inputDebounceRef={inputDebounceRef}
        />
      </div>

      <TableTanstack
        data={roles}
        columns={columns(columnActions)}
        columnFilters={columnFilters}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
}
