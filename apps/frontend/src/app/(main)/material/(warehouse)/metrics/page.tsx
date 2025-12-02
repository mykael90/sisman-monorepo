'use client';
import { Suspense } from 'react';
import Loading from '@/components/loading';
import { MetricsListPage } from './_components/list/metrics-list';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MetricsListPage />
    </Suspense>
  );
}
