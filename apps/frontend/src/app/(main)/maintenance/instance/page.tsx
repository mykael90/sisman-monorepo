import { MaintenanceInstanceListPage } from './_components/list/maintenance-instance-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import {
  getMaintenanceInstances,
  getRefreshedInstances
} from './maintenance-instance-actions';
import Loading from '@/components/loading';

export default async function Page() {
  const accessToken = await getSismanAccessToken();
  const [initialInstances] = await Promise.all([
    getMaintenanceInstances(accessToken)
  ]);
  const listKey = Date.now().toString() + Math.random().toString();

  return (
    // <Suspense fallback={<Loading />}>
    <MaintenanceInstanceListPage
      initialInstances={initialInstances}
      refreshAction={getRefreshedInstances}
      key={listKey}
    />
    // </Suspense>
  );
}
