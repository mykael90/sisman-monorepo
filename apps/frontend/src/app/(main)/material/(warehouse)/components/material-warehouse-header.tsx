'use client';

import { Building, Replace, Warehouse } from 'lucide-react';
import { useWarehouseContext } from '../../choose-warehouse/context/warehouse-provider';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

export default function MaterialWarehouseHeader() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className='border-border text-primary z-10 border-b bg-gray-50 p-2 backdrop-blur-sm'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div>
            <p className='text-muted-foreground text-sm'>Depósito Provisório</p>
            <div className='flex items-center gap-2'>
              <Warehouse className='text-muted-foreground h-4 w-4' />
              <h1 className='text-xl font-semibold'>{warehouse?.name}</h1>
            </div>
          </div>
        </div>
        <Button
          variant='outline'
          onClick={() =>
            router.push(`/material/choose-warehouse?callbackUrl=${pathname}`)
          }
        >
          <Replace className='mr-2 h-4 w-4' />
          Alterar Depósito
        </Button>
      </div>
    </div>
  );
}
