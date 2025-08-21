'use client';

import { Replace, Warehouse } from 'lucide-react';
import { useWarehouseContext } from '../../choose-warehouse/context/warehouse-provider';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

export default function MaterialWarehouseHeader() {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className='border-border text-primary z-10 border-b p-4 backdrop-blur-sm'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Warehouse className='h-8 w-8' />
          <h1 className='text-2xl font-semibold'>
            Depósito Provisório: {warehouse?.name}
          </h1>
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
