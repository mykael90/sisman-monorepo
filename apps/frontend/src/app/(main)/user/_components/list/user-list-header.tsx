'use client';

import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface UserListHeaderProps {
  onAddUser: () => void;
}

export function UserListHeader({ onAddUser }: UserListHeaderProps) {
  return (
    <div className='flex flex-col items-center justify-between sm:flex-row'>
      <div>
        <h1 className='text-2xl font-bold'>User Management</h1>
        <p className='text-muted-foreground'>
          Manage system users and their permissions
        </p>
      </div>
      <div className='flex place-self-end py-2'>
        <Button variant={'default'} onClick={onAddUser}>
          <UserPlus className='mr-2 h-4 w-4' />
          Add New User
        </Button>
      </div>
    </div>
  );
}
