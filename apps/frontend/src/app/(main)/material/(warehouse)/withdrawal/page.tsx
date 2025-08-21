import { WithdrawalListPage } from '@/src/app/(main)/material/(warehouse)/withdrawal/_components/list/withdrawal-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getWithdrawalsByWarehouse } from './withdrawal-actions';
import Logger from '@/lib/logger';
import Loading from '@/components/loading';

const logger = new Logger('withdrawal-management');

export default function Page() {
  return (
    <div>
      <WithdrawalListPage />
    </div>
  );
}
