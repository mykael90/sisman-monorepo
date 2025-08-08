'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export function MaterialOutputSummary() {
  const summaryData = {
    totalItems: 2,
    totalValue: 1250.5,
    pendingApproval: 0,
    readyToOutput: 2
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Package className='h-5 w-5' />
          Output Summary
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-primary/10 rounded-lg p-3 text-center'>
            <div className='text-primary text-2xl font-bold'>
              {summaryData.totalItems}
            </div>
            <div className='text-primary text-sm'>Total Items</div>
          </div>
          <div className='bg-accent/10 rounded-lg p-3 text-center'>
            <div className='text-accent text-2xl font-bold'>
              ${summaryData.totalValue.toFixed(2)}
            </div>
            <div className='text-accent text-sm'>Total Value</div>
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>Ready to Output</span>
            <Badge variant='default' className='bg-accent'>
              <CheckCircle className='mr-1 h-3 w-3' />
              {summaryData.readyToOutput}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>Pending Approval</span>
            <Badge variant='secondary'>
              <AlertTriangle className='mr-1 h-3 w-3' />
              {summaryData.pendingApproval}
            </Badge>
          </div>
        </div>

        <div className='border-t pt-2'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <TrendingUp className='h-4 w-4' />
            <span>Output efficiency: 95%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
