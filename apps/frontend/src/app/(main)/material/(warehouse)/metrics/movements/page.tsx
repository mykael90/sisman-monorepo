import Loading from '@/components/loading';
import { Suspense } from 'react';
import { MetricsListPage } from './list/metrics-list';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MetricsListPage />
    </Suspense>
  );
}
