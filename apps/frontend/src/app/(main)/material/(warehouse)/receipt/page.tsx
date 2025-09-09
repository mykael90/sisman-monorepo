import { ReceiptListPage } from './_components/list/receipt-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getReceiptsByWarehouse } from './receipt-actions';
import Logger from '@/lib/logger';
import Loading from '@/components/loading';
import { ReceiptListPageSkeleton } from './_components/list/receipt-list-skeleton';

const logger = new Logger('receipt-management');

export default function Page() {
  return (
    <Suspense fallback={<ReceiptListPageSkeleton />}>
      <ReceiptListPage />
    </Suspense>
  );
}
