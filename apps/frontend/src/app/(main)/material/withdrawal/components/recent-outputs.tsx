'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Package } from 'lucide-react';

export function RecentOutputs() {
  const recentOutputs = [
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
          Recent Outputs
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {recentOutputs.map((output) => (
          <div key={output.id} className='space-y-2 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>{output.id}</span>
              {getStatusBadge(output.status)}
            </div>
            <div className='text-xs text-gray-600'>
              <div>{output.date}</div>
              <div>
                {output.type} • {output.items} items
              </div>
              <div>Recipient: {output.recipient}</div>
            </div>
            <Button variant='outline' size='sm' className='w-full'>
              <Eye className='mr-1 h-3 w-3' />
              View Details
            </Button>
          </div>
        ))}

        <Button variant='outline' className='w-full'>
          View All Outputs
        </Button>
      </CardContent>
    </Card>
  );
}
