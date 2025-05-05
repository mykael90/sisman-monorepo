'use client';

import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface UserManagementHeaderProps {
  onAddUser: () => void;
}

export function UserManagementHeader({ onAddUser }: UserManagementHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold'>User Management</h1>
        <p className='text-muted-foreground'>
          Manage system users and their permissions
        </p>
      </div>
      <Button variant={'default'} onClick={onAddUser}>
        <UserPlus className='mr-2 h-4 w-4' />
        Add New User
      </Button>
    </div>
  );
}
