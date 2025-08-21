'use client';

import { Button } from '@/components/ui/button';
import Logger from '@/lib/logger';
import { ArrowLeft, PackageMinus, Warehouse } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TabSelector } from '../_components/add/tab-selector';

const logger = new Logger(`src/app/(main)/material/withdrawal/layout.tsx`);

export default function MaterialWithdrawalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <div className='flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
        <div className='flex items-center'>
          <div className='mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-lg'>
            <PackageMinus className='h-6 w-6' />
          </div>
          <div>
            <h1 className='text-primary text-xl font-bold'>
              Retirada de material
            </h1>
            <p className='text-md text-muted-foreground'>
              Selecione o tipo de retirada e preencha o formulário.
            </p>
          </div>
        </div>
        <div className='flex w-full justify-end sm:w-auto'>
          <Button variant='outline' onClick={() => router.push('/material')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para listagem
          </Button>
        </div>
      </div>
      <TabSelector />
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
