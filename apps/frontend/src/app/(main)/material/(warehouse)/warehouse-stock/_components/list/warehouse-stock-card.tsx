'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IWarehouseStockWithRelations } from '../../warehouse-stock-types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface WarehouseStockCardProps {
  warehouseStock: IWarehouseStockWithRelations;
}

export function WarehouseStockCard({
  warehouseStock
}: WarehouseStockCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/material/warehouse-stock/edit/${warehouseStock.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estoque #{warehouseStock.id}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-2'>
        <div className='flex justify-between'>
          <span className='font-semibold'>Material:</span>
          <span>{warehouseStock.material?.name || 'N/A'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Armazém:</span>
          <span>{warehouseStock.warehouse?.name || 'N/A'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Quantidade Física:</span>
          <span>
            {warehouseStock.physicalOnHandQuantity
              ? warehouseStock.physicalOnHandQuantity.toString()
              : 'N/A'}
          </span>
        </div>
        <Button onClick={handleEdit} className='mt-2'>
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
