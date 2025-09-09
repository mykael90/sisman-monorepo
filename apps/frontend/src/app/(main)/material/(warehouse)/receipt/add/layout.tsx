'use client';

import { Button } from '@/components/ui/button';
import Logger from '@/lib/logger';
import { ArrowLeft, PackageMinus, Warehouse } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TabSelector } from '../_components/add/tab-selector';

const logger = new Logger(`src/app/(main)/material/receipt/layout.tsx`);

export default function MaterialReceiptLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className='mx-auto space-y-6 pt-4 pb-6'>
      <div className='flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
        <div className='flex items-center px-2'>
          <div className='mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-lg'>
            <PackageMinus className='h-6 w-6' />
          </div>
          <div>
            <h1 className='text-primary text-xl font-bold'>
              Entrada de material
            </h1>
            <p className='text-md text-muted-foreground'>
              Selecione o tipo de Entrada e preencha o formulário.
            </p>
          </div>
        </div>
        <div className='flex w-full justify-end sm:w-auto'>
          <Button
            variant='outline'
            onClick={() => router.push('/material/receipt')}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para listagem
          </Button>
        </div>
      </div>
      {/* <TabSelector /> */}
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
