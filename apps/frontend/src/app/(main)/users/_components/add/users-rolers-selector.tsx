'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Info } from 'lucide-react';
import type { JSX } from 'react';

interface Role {
  id: string;
  name: string;
  icon: JSX.Element;
}

interface UserRolesSelectorProps {
  onRolesChange: (roles: string[]) => void;
  initialSelectedRoles?: string[];
}

export function UserRolesSelector({
  onRolesChange,
  initialSelectedRoles = []
}: UserRolesSelectorProps) {
  const [selectedRoles, setSelectedRoles] =
    useState<string[]>(initialSelectedRoles);

  const availableRoles: Role[] = [
    {
      id: 'administrator',
      name: 'Administrator',
      icon: (
        <div className='mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500'>
          <div className='h-1 w-1 rounded-full bg-white'></div>
        </div>
      )
    },
    {
      id: 'content-editor',
      name: 'Content Editor',
      icon: (
        <div className='mr-2 h-4 w-4 text-purple-500'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
          >
            <path d='M12 20h9'></path>
            <path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'></path>
          </svg>
        </div>
      )
    },
    {
      id: 'support',
      name: 'Support',
      icon: (
        <div className='mr-2 h-4 w-4 text-orange-500'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
          >
            <path d='M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z'></path>
          </svg>
        </div>
      )
    },
    {
      id: 'viewer',
      name: 'Viewer',
      icon: (
        <div className='mr-2 h-4 w-4 text-gray-500'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
          >
            <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
            <circle cx='12' cy='12' r='3'></circle>
          </svg>
        </div>
      )
    }
  ];

  const addRole = (roleId: string) => {
    if (!selectedRoles.includes(roleId)) {
      const newSelectedRoles = [...selectedRoles, roleId];
      setSelectedRoles(newSelectedRoles);
      onRolesChange(newSelectedRoles);
    }
  };

  const removeRole = (roleId: string) => {
    const newSelectedRoles = selectedRoles.filter((id) => id !== roleId);
    setSelectedRoles(newSelectedRoles);
    onRolesChange(newSelectedRoles);
  };

  const getAvailableRoles = () => {
    return availableRoles.filter((role) => !selectedRoles.includes(role.id));
  };

  const getSelectedRoles = () => {
    return availableRoles.filter((role) => selectedRoles.includes(role.id));
  };

  return (
    <div className='flex gap-4'>
      <div className='w-1/2 rounded-md border p-3'>
        <h4 className='mb-2 text-sm font-medium'>Available Roles</h4>
        <div className='space-y-2'>
          {getAvailableRoles().map((role) => (
            <div
              key={role.id}
              className='flex items-center justify-between rounded p-2 hover:bg-gray-50'
            >
              <div className='flex items-center'>
                {role.icon}
                <span>{role.name}</span>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => addRole(role.id)}
                className='h-6 w-6 p-0'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className='flex flex-col justify-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          disabled={getAvailableRoles().length === 0}
          className='h-8 w-8 p-0'
        >
          <ChevronRight className='h-5 w-5' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          disabled={selectedRoles.length === 0}
          className='h-8 w-8 p-0'
        >
          <ChevronLeft className='h-5 w-5' />
        </Button>
      </div>

      <div className='w-1/2 rounded-md border p-3'>
        <h4 className='mb-2 text-sm font-medium'>Assigned Roles</h4>
        {selectedRoles.length > 0 ? (
          <div className='space-y-2'>
            {getSelectedRoles().map((role) => (
              <div
                key={role.id}
                className='flex items-center justify-between rounded p-2 hover:bg-gray-50'
              >
                <div className='flex items-center'>
                  {role.icon}
                  <span>{role.name}</span>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeRole(role.id)}
                  className='h-6 w-6 p-0'
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-32 flex-col items-center justify-center text-gray-400'>
            <Info className='mb-2 h-5 w-5' />
            <p className='text-sm'>No roles assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}
