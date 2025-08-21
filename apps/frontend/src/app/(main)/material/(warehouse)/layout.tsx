'use client';

import Logger from '@/lib/logger';
import { useSession } from 'next-auth/react';
import MaterialWarehouseHeader from './components/material-warehouse-header';

const logger = new Logger(`src/app/(main)/material/withdrawal/layout.tsx`);

export default function MaterialWithdrawalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();

  return (
    <div className='min-h-screen'>
      <MaterialWarehouseHeader />
      <div className='mx-auto max-w-7xl space-y-6 p-4'>
        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
