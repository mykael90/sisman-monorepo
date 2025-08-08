'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MaterialWithdrawalForm } from '../components/material-withdrawal-form';
import { MaterialWithdrawalSummary } from '../components/material-withdrawal-summary';
import { RecentWithdrawals } from '../components/recent-withdrawals';
import { Package, Warehouse } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function InternalUsePage() {
  const pathname = usePathname();
  const withdrawalType = pathname.split('/').pop() || 'internal-use'; // Get the last segment of the URL

  return (
    <div>
      {/* <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'> */}
      <div>
        {/* Main Form */}
        <MaterialWithdrawalForm withdrawalType={withdrawalType} />

        {/* Sidebar */}
        {/* <div className='space-y-6'>
          <MaterialWithdrawalSummary />
          <RecentWithdrawals />
        </div> */}
      </div>
    </div>
  );
}
