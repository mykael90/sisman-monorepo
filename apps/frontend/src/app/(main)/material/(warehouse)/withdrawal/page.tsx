import { WithdrawalListPage } from '@/src/app/(main)/material/(warehouse)/withdrawal/_components/list/withdrawal-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getRefreshedWithdrawals, getWithdrawals } from './withdrawal-actions';
import Logger from '@/lib/logger';
import Loading from '@/components/loading';

const logger = new Logger('withdrawal-management');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  const [initialWithdrawals] = await Promise.all([
    getWithdrawals(accessTokenSisman)
  ]);

  const listKey = Date.now().toString() + Math.random().toString();

  return (
    <WithdrawalListPage
      initialWithdrawals={initialWithdrawals}
      refreshAction={getRefreshedWithdrawals}
      key={listKey}
    />
  );
}
