'use client';

import { useRouter } from 'next/navigation';
import { IMaintenanceInstanceWithRelations } from '../../instance-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

export function ActionsDropdown({
  instance
}: {
  instance: IMaintenanceInstanceWithRelations;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(String(instance.id))}
        >
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.push(`/maintenance/instance/edit/${instance.id}`)
          }
        >
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-red-600'
          onClick={() =>
            router.push(`/maintenance/instance/delete/${instance.id}`)
          }
        >
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
