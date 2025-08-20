'use client';

import { Warehouse } from 'lucide-react';
import Logger from '@/lib/logger';
import { TabSelector } from './withdrawal/components/tab-selector';
import { useSession } from 'next-auth/react';
import { useWarehouseContext } from '../choose-warehouse/context/warehouse-provider';
import { Button } from '../../../../components/ui/button';
import { useRouter } from 'next/navigation';

const logger = new Logger(`src/app/(main)/material/withdrawal/layout.tsx`);

export default function MaterialWithdrawalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();

  const { warehouse } = useWarehouseContext();

  const router = useRouter();

  return (
    <div className='bg-background min-h-screen'>
      <div className='border-primary-foreground/10 bg-primary/80 text-primary-foreground sticky top-0 z-10 border-b p-4 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Warehouse className='h-8 w-8' />
            <h1 className='text-2xl font-semibold'>
              Depósito Provisório: {warehouse?.name}
            </h1>
            <Button
              variant='outline'
              onClick={() => router.push('/material/choose-warehouse')}
            >
              Aqui
            </Button>
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-7xl space-y-6 p-4'>
        {/* Output Type Tabs */}
        <TabSelector />
        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
