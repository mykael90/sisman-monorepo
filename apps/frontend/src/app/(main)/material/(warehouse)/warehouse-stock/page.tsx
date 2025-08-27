'use client';

import { WarehouseStockListPage } from './_components/list/warehouse-stock-list';
import { Suspense } from 'react';
import Loading from '@/components/loading';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <WarehouseStockListPage />
    </Suspense>
  );
}
