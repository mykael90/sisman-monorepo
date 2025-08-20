import { Warehouse } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/_options';
import Logger from '@/lib/logger';
import { TabSelector } from './withdrawal/components/tab-selector';

const logger = new Logger(`src/app/(main)/material/withdrawal/layout.tsx`);

export default async function MaterialWithdrawalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // 1. Chama a Server Action no servidor
  if (!session?.user.maintenanceInstanceId) {
    return null;
  }

  return (
    <div className='bg-background min-h-screen'>
      <div className='border-primary-foreground/10 bg-primary/80 text-primary-foreground sticky top-0 z-10 border-b p-4 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Warehouse className='h-8 w-8' />
            <h1 className='text-2xl font-semibold'>Depósito Provisório: XXX</h1>
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-7xl space-y-6 p-4'>
        {/* Output Type Tabs */}
        <TabSelector />
        {/* Main Content */}
        <main>{children}</main>
        {/* <main>{children}</main> */}
      </div>
    </div>
  );
}
