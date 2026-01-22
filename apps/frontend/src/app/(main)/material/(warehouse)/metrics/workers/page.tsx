import Loading from '@/components/loading';
import { Suspense } from 'react';
import { WorkersWithdrawalsListPage } from './list/workers-withdrawals-list';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <WorkersWithdrawalsListPage />
    </Suspense>
  );
}
