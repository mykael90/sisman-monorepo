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
      <div className='container mx-auto space-y-6 px-2 pt-2 md:px-0'>
        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
