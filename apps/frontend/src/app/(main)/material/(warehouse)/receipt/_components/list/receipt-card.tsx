'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMaterialReceiptWithRelations } from '../../receipt-types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ReceiptCardProps {
  receipt: IMaterialReceiptWithRelations;
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/material/receipt/edit/${receipt.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrada #{receipt.id}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-2'>
        <div className='flex justify-between'>
          <span className='font-semibold'>Data:</span>
          <span>{new Date(receipt.receiptDate).toLocaleDateString()}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Fornecedor (ou doador):</span>
          <span>{receipt.sourceName || 'N/A'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Documento de Entrada:</span>
          <span>{receipt.externalReference || 'N/A'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Tipo de Entrada:</span>
          <span>{receipt.movementType?.name || 'N/A'}</span>
        </div>
        <Button onClick={handleEdit} className='mt-2'>
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
