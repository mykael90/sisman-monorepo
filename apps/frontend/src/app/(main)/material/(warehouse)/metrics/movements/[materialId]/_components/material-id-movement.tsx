'use client';

import { useRouter } from 'next/navigation';
import { useWarehouseContext } from '../../../../../choose-warehouse/context/warehouse-provider';
import { useState } from 'react';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { IMaterialStockMovementMetricsByWarehouseAndByMaterial } from '../../../metrics-types';
import { getMaterialStockMovementMetricsTimeByWarehouseIdAndMaterialId } from '../../../metrics-actions';
import Loading from '../../../../../../loading';
import { Separator } from '../../../../../../../../components/ui/separator';
import { DateRangeFilter } from '../../../../../../../../components/filters/date-range-filter';

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

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <div className='mt-4 mb-4 h-auto rounded-xl border-0 bg-white px-4 py-3.5'>
        <div className='text-md mb-2 font-semibold'>
          Métricas retornadas no intervalo das datas
        </div>

        <Separator className='my-2' />
        <div className='flex flex-col gap-4 md:flex-row'>
          <DateRangeFilter date={date} setDate={setDateState} />
        </div>
      </div>
      {JSON.stringify(metricsDataByMaterialId, null, 2)}
    </>
  );
}
