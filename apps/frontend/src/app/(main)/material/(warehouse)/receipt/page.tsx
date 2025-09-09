import { ReceiptListPage } from '@/src/app/(main)/material/(warehouse)/receipt/_components/list/receipt-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getReceiptsByWarehouse } from './receipt-actions';
import Logger from '@/lib/logger';
import Loading from '@/components/loading';

const logger = new Logger('receipt-management');

export default function Page() {
  return (
    <div>
      <ReceiptListPage />
    </div>
  );
}
