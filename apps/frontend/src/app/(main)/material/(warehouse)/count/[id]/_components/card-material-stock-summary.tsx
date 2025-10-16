'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { IWarehouseStockWithRelations } from '../../warehouse-stock/warehouse-stock-types';

export function CardMaterialStockSummary({
  materialStock
}: {
  materialStock: IWarehouseStockWithRelations;
}) {
  console.log(materialStock);
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Informações do Material</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Código</Label>
            <p className='text-muted-foreground'>{materialStock.material.id}</p>
          </div>
          <div className='space-y-2'>
            <Label>Material</Label>
            <p className='text-muted-foreground'>
              {materialStock.material.name}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1'>
          <div className='space-y-2'>
            <Label>Descrição</Label>
            <p className='text-muted-foreground'>
              {materialStock.material.description}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Almoxarifado</Label>
            <p className='text-muted-foreground'>
              {materialStock.warehouse.name}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Quantidade em Mãos</Label>
            <p className='text-muted-foreground'>
              {String(materialStock.physicalOnHandQuantity)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
