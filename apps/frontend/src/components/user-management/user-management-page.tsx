'use client';

import { UserManagementHeader } from './user-management-header';
import { UserFilters } from './user-filters';
import { UserTable } from './user-table';
import { UserPagination } from './user-pagination';
import React, { use, useState } from 'react';
import initialUsers from './user-data-example';
import { UserWithRoles1 } from '../../../types/user';
import { getUsers } from '../../app/(main)/user-management/_actions';
import { ColumnFiltersState } from '@tanstack/react-table';

export function UserManagementPage({ dataPromise, refreshAction }) {
  const initialData: UserWithRoles1[] = use(dataPromise);

  const [users, setUsers] = useState(initialData);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const totalEntries = 100;
  const entriesPerPage = 3;

  // Função para adicionar novo usuário
  const handleAddUser = () => {
    // Implementação futura
    console.log('Add new user');
  };

  // Função para editar usuário
  const handleEditUser = (userId: number) => {
    // Implementação futura
    console.log('Edit user', userId);
  };

  // Função para excluir usuário
  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <div className='container mx-auto p-4'>
      <UserManagementHeader onAddUser={handleAddUser} />

      <div className='mt-4 mb-4 h-16 rounded-xl border-0 bg-white px-4 py-3.5'>
        <UserFilters setColumnFilters={setColumnFilters} />
      </div>

      <UserTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />

      <div className='mt-1 h-14 rounded-b-md border-0 bg-white px-4 py-3.5'>
        <UserPagination
          currentPage={currentPage}
          totalEntries={totalEntries}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
