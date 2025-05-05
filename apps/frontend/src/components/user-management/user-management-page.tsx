'use client';

import { UserManagementHeader } from './user-management-header';
import { UserFilters } from './user-filters';
import { UserTable } from './user-table';
import { UserPagination } from './user-pagination';
import { useState } from 'react';
import type { User } from '@/types/user';
import initialUsers from './user-data-example';

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const totalEntries = 100;
  const entriesPerPage = 3;

  // Função para adicionar novo usuário
  const handleAddUser = () => {
    // Implementação futura
    console.log('Add new user');
  };

  // Função para editar usuário
  const handleEditUser = (userId: string) => {
    // Implementação futura
    console.log('Edit user', userId);
  };

  // Função para excluir usuário
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  // Função para limpar filtros
  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('All Roles');
    setStatusFilter('All Status');
  };

  return (
    <div className='container mx-auto p-4'>
      <UserManagementHeader onAddUser={handleAddUser} />

      <div className='mt-4 mb-4 h-16 rounded-xl border-0 bg-white px-4 py-3.5'>
        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      <UserTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
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
