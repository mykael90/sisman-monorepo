'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMaterialStockMovementMetricsByWarehouse } from '../../metrics-types'; // Importar os tipos corretos
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface MetricsCardProps {
  metrics: IMaterialStockMovementMetricsByWarehouse;
}

export function MetricsCard({ metrics }: MetricsCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    // TODO: Implementar navegação para uma página de detalhes de métricas, se houver.
    // router.push(`/material/metrics/details/${metrics.materialId}`);
    console.log('View metrics details for material:', metrics.materialId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas do Material: {metrics.materialName}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-2'>
        <div className='flex justify-between'>
          <span className='font-semibold'>ID Material:</span>
          <span>{metrics.materialId || 'N/A'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Qtd. Entrada Total:</span>
          <span>
            {metrics.totalInQuantity
              ? Number(metrics.totalInQuantity).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Qtd. Saída Total:</span>
          <span>
            {metrics.totalOutQuantity
              ? Number(metrics.totalOutQuantity).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Valor Entrada Total (R$):</span>
          <span>
            {metrics.totalInValue
              ? Number(metrics.totalInValue).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold'>Valor Saída Total (R$):</span>
          <span>
            {metrics.totalOutValue
              ? Number(metrics.totalOutValue).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </span>
        </div>
        <Button onClick={handleViewDetails} className='mt-2'>
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
