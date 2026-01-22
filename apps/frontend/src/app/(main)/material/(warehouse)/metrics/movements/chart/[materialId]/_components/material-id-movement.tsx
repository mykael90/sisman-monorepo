'use client';

import { useRouter } from 'next/navigation';
import { useWarehouseContext } from '../../../../../../choose-warehouse/context/warehouse-provider';
import { useState, useMemo } from 'react';
import { addDays, endOfDay, setYear, startOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IMaterialStockMovementMetricsByWarehouseAndByMaterial,
  IMonthlyMetric
} from '../../../../metrics-types';
import { getMaterialStockMovementMetricsTimeByWarehouseIdAndMaterialId } from '../../../../metrics-actions';
import Loading from '../../../../../../../loading';
import { Separator } from '../../../../../../../../../components/ui/separator';
import { DateRangeFilter } from '../../../../../../../../../components/filters/date-range-filter';

// Shadcn UI Chart components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../../../../../../../../../components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent
} from '../../../../../../../../../components/ui/chart';

// Recharts components necessários para o gráfico misto (Barra + Linha)
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Bar,
  Line,
  Cell,
  ReferenceLine
} from 'recharts';

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

/**
 * Interface para representar um ponto de dados no gráfico de saldo.
 */
export interface IBalanceChartData {
  label: string;
  year: number;
  month: number;
  inQuantity: number;
  outQuantity: number;
  simpleBalance: number;
  accumulatedBalance: number;
}

/**
 * Lógica para processar o saldo mensal e acumulado.
 */
export function generateBalanceChartData(
  data: IMaterialStockMovementMetricsByWarehouseAndByMaterial,
  resetAccumulatorYearly: boolean = false
): IBalanceChartData[] {
  const inOperations =
    data.operationsByMonth.find((op) => op.operation === 'IN')?.months || [];
  const outOperations =
    data.operationsByMonth.find((op) => op.operation === 'OUT')?.months || [];

  const metricsMap = new Map<
    string,
    { year: number; month: number; inQty: number; outQty: number }
  >();

  const populateMap = (list: IMonthlyMetric[], isIn: boolean) => {
    list.forEach((item) => {
      const key = `${item.year}-${item.month.toString().padStart(2, '0')}`;
      if (!metricsMap.has(key)) {
        metricsMap.set(key, {
          year: item.year,
          month: item.month,
          inQty: 0,
          outQty: 0
        });
      }
      const entry = metricsMap.get(key)!;
      const qty = parseFloat(item.totalQuantity || '0');
      if (isIn) entry.inQty = qty;
      else entry.outQty = qty;
    });
  };

  populateMap(inOperations, true);
  populateMap(outOperations, false);

  const sortedData = Array.from(metricsMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  let currentAccumulator = 0;
  const result: IBalanceChartData[] = [];

  sortedData.forEach((item) => {
    if (resetAccumulatorYearly && item.month === 1) {
      currentAccumulator = 0;
    }
    const simpleBalance = item.inQty - item.outQty;
    currentAccumulator += simpleBalance;

    result.push({
      label: `${item.month.toString().padStart(2, '0')}/${item.year}`,
      year: item.year,
      month: item.month,
      inQuantity: item.inQty,
      outQuantity: item.outQty,
      simpleBalance: parseFloat(simpleBalance.toFixed(2)),
      accumulatedBalance: parseFloat(currentAccumulator.toFixed(2))
    });
  });

  return result;
}

export function MaterialIdMovementMetricsPage({
  materialId
}: {
  materialId: string;
}) {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [date, setDateState] = useState<DateRange | undefined>({
    from: startOfYear(setYear(new Date(), currentYear - 5)),
    to: addDays(endOfDay(new Date()), 0)
  });

  const { data: metricsDataByMaterialId, isLoading } = useQuery<
    IMaterialStockMovementMetricsByWarehouseAndByMaterial,
    Error
  >({
    queryKey: ['materialMetricsByMaterial', warehouse?.id, date],
    queryFn: () =>
      getMaterialStockMovementMetricsTimeByWarehouseIdAndMaterialId(
        warehouse?.id as number,
        materialId,
        { from: date?.from, to: date?.to }
      ),
    enabled: !!warehouse && !!materialId && !!date?.from && !!date?.to
  });

  // 1. Dados para os gráficos anuais (Área) - Lógica existente mantida
  const chartsByYear = useMemo(() => {
    if (!metricsDataByMaterialId?.operationsByMonth) return [];

    const tempMap: Record<
      number,
      Record<
        number,
        { monthName: string; inQuantity: number; outQuantity: number }
      >
    > = {};

    metricsDataByMaterialId.operationsByMonth.forEach((operationEntry) => {
      if (
        operationEntry.operation === 'IN' ||
        operationEntry.operation === 'OUT'
      ) {
        operationEntry.months.forEach((monthData) => {
          const year = monthData.year;
          const month = monthData.month;
          if (!tempMap[year]) tempMap[year] = {};
          if (!tempMap[year][month]) {
            tempMap[year][month] = {
              monthName: monthNames[month - 1],
              inQuantity: 0,
              outQuantity: 0
            };
          }
          if (operationEntry.operation === 'IN')
            tempMap[year][month].inQuantity += parseFloat(
              monthData.totalQuantity
            );
          else if (operationEntry.operation === 'OUT')
            tempMap[year][month].outQuantity += parseFloat(
              monthData.totalQuantity
            );
        });
      }
    });

    return Object.keys(tempMap)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        data: Object.entries(tempMap[year])
          .sort(([mA], [mB]) => Number(mA) - Number(mB))
          .map(([, data]) => data)
      }));
  }, [metricsDataByMaterialId]);

  // 2. Dados para o gráfico de Balanço (Balance) - Período Completo
  const balanceChartData = useMemo(() => {
    if (!metricsDataByMaterialId) return [];
    return generateBalanceChartData(metricsDataByMaterialId);
  }, [metricsDataByMaterialId]);

  // Configuração do Shadcn Chart
  const chartConfig = {
    inQuantity: { label: 'Entradas', color: 'var(--accent)' }, // Verde padrão Shadcn ou custom
    outQuantity: { label: 'Saídas', color: 'var(--destructive)' },
    simpleBalance: { label: 'Balanço Mensal', color: 'var(--primary)' },
    accumulatedBalance: {
      label: 'Balanço Acumulado',
      color: 'var(--secondary)'
    }
  } satisfies ChartConfig;

  if (isLoading) return <Loading />;

  return (
    <div className='mt-4 space-y-6'>
      {/* <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <div className='text-md mb-2 font-semibold'>
          Métricas retornadas no intervalo das datas
        </div>
        <Separator className='my-2' />
        <div className='flex flex-col gap-4 md:flex-row'>
          <DateRangeFilter date={date} setDate={setDateState} />
        </div>
      </div> */}

      {chartsByYear.length === 0 ? (
        <div className='text-muted-foreground p-4 text-center'>
          Nenhum dado encontrado para o período selecionado.
        </div>
      ) : (
        <>
          {/* --- NOVO GRÁFICO: SALDO (COMPOSED CHART) --- */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Evolução de Balanço (Últimos 5 Anos)</CardTitle>
              <CardDescription>
                Comparativo entre o balanço mensal (barras) e o acumulado no
                tempo (linha).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className='aspect-auto h-[350px] w-full'
              >
                <ComposedChart
                  data={balanceChartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />

                  {/* Eixo X: Mes/Ano */}
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={30}
                  />

                  {/* Eixo Y */}
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} />

                  {/* Linha de referência no Zero para facilitar leitura de saldos negativos */}
                  <ReferenceLine y={0} stroke='#9ca3af' strokeDasharray='3 3' />

                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => value} // Mostra o label do eixo X (Data)
                        indicator='line'
                      />
                    }
                  />

                  <ChartLegend content={<ChartLegendContent />} />

                  {/* Barras: Balanço Mensal (Verde se > 0, Vermelho se < 0) */}
                  <Bar
                    dataKey='simpleBalance'
                    name='Balanço Mensal'
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {balanceChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.simpleBalance >= 0 ? '#10b981' : '#ef4444'}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>

                  {/* Linha: Balanço Acumulado */}
                  <Line
                    type='monotone'
                    dataKey='accumulatedBalance'
                    name='Balanço Acumulado'
                    stroke='var(--color-accumulatedBalance)'
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Separator className='my-6' />

          {/* --- GRÁFICOS ANTIGOS: MOVIMENTAÇÃO POR ANO --- */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {chartsByYear.map((yearGroup) => (
              <Card key={yearGroup.year} className='min-w-0'>
                <CardHeader>
                  <CardTitle>Movimentação: {yearGroup.year}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className='aspect-auto h-[250px] w-full'
                  >
                    <AreaChart
                      data={yearGroup.data}
                      margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id={`fillOut-${yearGroup.year}`}
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
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
                        <linearGradient
                          id={`fillIn-${yearGroup.year}`}
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
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
                        dataKey='monthName'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        domain={[0, 'auto']}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator='dot' />}
                      />

                      <Area
                        dataKey='outQuantity'
                        type='natural'
                        name='Saídas'
                        fill={`url(#fillOut-${yearGroup.year})`}
                        fillOpacity={0.4}
                        stroke='var(--color-outQuantity)'
                        stackId='1' // Opcional: remover stackId se quiser sobreposto
                      />
                      <Area
                        dataKey='inQuantity'
                        type='natural'
                        name='Entradas'
                        fill={`url(#fillIn-${yearGroup.year})`}
                        fillOpacity={0.4}
                        stroke='var(--color-inQuantity)'
                        stackId='2' // Opcional
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
