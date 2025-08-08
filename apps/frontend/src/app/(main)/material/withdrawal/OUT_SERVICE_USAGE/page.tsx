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
import { MaterialOutputForm } from '../components/material-output-form';
import { MaterialOutputSummary } from '../components/material-output-summary';
import { RecentOutputs } from '../components/recent-outputs';
import { Package, Warehouse } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function InternalUsePage() {
  const pathname = usePathname();
  const outputType = pathname.split('/').pop() || 'internal-use'; // Get the last segment of the URL

  return (
    <div>
      {/* <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'> */}
      <div>
        {/* Main Form */}
        <MaterialOutputForm outputType={outputType} />

        {/* Sidebar */}
        {/* <div className='space-y-6'>
          <MaterialOutputSummary />
          <RecentOutputs />
        </div> */}
      </div>
    </div>
  );
}
