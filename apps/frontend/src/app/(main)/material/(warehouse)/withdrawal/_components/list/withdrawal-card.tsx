
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IMaterialWithdrawalWithRelations } from '../../withdrawal-types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface WithdrawalCardProps {
  withdrawal: IMaterialWithdrawalWithRelations;
}

export function WithdrawalCard({ withdrawal }: WithdrawalCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/material/withdrawal/edit/${withdrawal.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retirada #{withdrawal.id}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="flex justify-between">
          <span className="font-semibold">Data:</span>
          <span>{new Date(withdrawal.withdrawalDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Coletado por:</span>
          <span>{withdrawal.collectedByUser?.name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Tipo de Movimento:</span>
          <span>{withdrawal.movementType?.name || 'N/A'}</span>
        </div>
        <Button onClick={handleEdit} className="mt-2">
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
