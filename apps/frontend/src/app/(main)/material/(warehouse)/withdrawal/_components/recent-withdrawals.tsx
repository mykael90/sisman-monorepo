'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Package } from 'lucide-react';

export function RecentWithdrawals() {
  const recentWithdrawals = [
    {
      id: 'OUT-2024-001',
      date: '2024-01-15',
      type: 'Internal Use',
      items: 5,
      recipient: 'João da Silva',
      status: 'completed'
    },
    {
      id: 'OUT-2024-002',
      date: '2024-01-14',
      type: 'Disposal',
      items: 3,
      recipient: 'Maria Santos',
      status: 'pending'
    },
    {
      id: 'OUT-2024-003',
      date: '2024-01-13',
      type: 'Return to Supplier',
      items: 8,
      recipient: 'Carlos Oliveira',
      status: 'completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className='bg-accent'>Completed</Badge>;
      case 'pending':
        return <Badge variant='secondary'>Pending</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Clock className='h-5 w-5' />
          Recent Withdrawals
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {recentWithdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className='space-y-2 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>{withdrawal.id}</span>
              {getStatusBadge(withdrawal.status)}
            </div>
            <div className='text-xs text-gray-600'>
              <div>{withdrawal.date}</div>
              <div>
                {withdrawal.type} • {withdrawal.items} items
              </div>
              <div>Recipient: {withdrawal.recipient}</div>
            </div>
            <Button variant='outline' size='sm' className='w-full'>
              <Eye className='mr-1 h-3 w-3' />
              View Details
            </Button>
          </div>
        ))}

        <Button variant='outline' className='w-full'>
          View All Withdrawals
        </Button>
      </CardContent>
    </Card>
  );
}
