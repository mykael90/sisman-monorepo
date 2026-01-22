'use client';

import { useRouter } from 'next/navigation';
import { useWarehouseContext } from '../../../../../choose-warehouse/context/warehouse-provider';
import { useState } from 'react';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { IMaterialStockMovementMetricsByWarehouseAndByMaterial } from '../../../metrics-types';
import { getMaterialStockMovementMetricsTimeByWarehouseIdAndMaterialId } from '../../../metrics-actions';
import Loading from '../../../../../../loading';
import { Separator } from '../../../../../../../../components/ui/separator';
import { DateRangeFilter } from '../../../../../../../../components/filters/date-range-filter';

// Shadcn UI Chart components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../../../../../../../components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '../../../../../../../../components/ui/chart';

// Recharts components
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// Lucide React icons
import { TrendingUp } from 'lucide-react';

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

export function MaterialIdMovementMetricsPage({
  materialId
}: {
  materialId: string;
}) {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  // const isDesktop = useMediaQuery('(min-width: 768px)');

  const [date, setDateState] = useState<DateRange | undefined>({
    from: subDays(startOfDay(new Date()), 100),
    to: addDays(endOfDay(new Date()), 100) // Usar endOfDay para definir o final do dia
  });

  const {
    data: metricsDataByMaterialId,
    isLoading,
    isError,
    error
  } = useQuery<IMaterialStockMovementMetricsByWarehouseAndByMaterial, Error>({
    queryKey: ['materialMetricsByMaterial', warehouse?.id, date],
    queryFn: () =>
      getMaterialStockMovementMetricsTimeByWarehouseIdAndMaterialId(
        warehouse?.id as number,
        materialId,
        {
          from: date?.from,
          to: date?.to
        }
      ),
    enabled: !!warehouse && !!materialId && !!date?.from && !!date?.to
  });

  const chartData = React.useMemo(() => {
    if (!metricsDataByMaterialId?.operationsByMonth) return [];

    const monthlyDataMap: {
      [key: string]: { month: string; inQuantity: number; outQuantity: number };
    } = {};

    metricsDataByMaterialId.operationsByMonth.forEach((operationEntry) => {
      if (
        operationEntry.operation === 'IN' ||
        operationEntry.operation === 'OUT'
      ) {
        operationEntry.months.forEach((monthData) => {
          const monthKey = `${monthData.year}-${String(monthData.month).padStart(2, '0')}`;
          if (!monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey] = {
              month: `${monthNames[monthData.month - 1]} ${monthData.year}`,
              inQuantity: 0,
              outQuantity: 0
            };
          }
          if (operationEntry.operation === 'IN') {
            monthlyDataMap[monthKey].inQuantity += parseFloat(
              monthData.totalQuantity
            );
          } else if (operationEntry.operation === 'OUT') {
            monthlyDataMap[monthKey].outQuantity += parseFloat(
              monthData.totalQuantity
            );
          }
        });
      }
    });

    const sortedData = Object.entries(monthlyDataMap)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => value);

    return sortedData;
  }, [metricsDataByMaterialId]);

  const chartConfig: ChartConfig = {
    inQuantity: {
      label: 'Entradas',
      color: 'hsl(12 76% 61%)' // Um tom de laranja/vermelho
    },
    outQuantity: {
      label: 'Saídas',
      color: 'hsl(221 83% 53%)' // Um tom de azul
    }
  } satisfies ChartConfig;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='mt-4'>
      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <div className='text-md mb-2 font-semibold'>
          Métricas retornadas no intervalo das datas
        </div>

        <Separator className='my-2' />
        <div className='flex flex-col gap-4 md:flex-row'>
          <DateRangeFilter date={date} setDate={setDateState} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Movimentação Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12
              }}
            >
              <defs>
                <linearGradient id='fillOut' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-outQuantity)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-outQuantity)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id='fillIn' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-inQuantity)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-inQuantity)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <Area
                dataKey='outQuantity'
                type='natural'
                fill='url(#fillOut)'
                fillOpacity={0.4}
                stroke='var(--color-outQuantity)'
              />
              <Area
                dataKey='inQuantity'
                type='natural'
                fill='url(#fillIn)'
                fillOpacity={0.4}
                stroke='var(--color-inQuantity)'
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
