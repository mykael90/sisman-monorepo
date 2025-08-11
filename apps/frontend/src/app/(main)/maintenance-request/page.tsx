import { MaintenanceRequestList } from '@/src/app/(main)/maintenance-request/_components/list/maintenance-request-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';
import {
  getRefreshedMaintenanceRequests,
  getMaintenanceRequests
} from './maintenance-request-actions';
import Logger from '../../../lib/logger';
import Loading from '../../../components/loading';

const logger = new Logger('maintenance-requests-management');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  const [initialRequests] = await Promise.all([
    getMaintenanceRequests(accessTokenSisman)
  ]);

  const listKey = Date.now().toString() + Math.random().toString();

  return (
    <Suspense fallback={<Loading />}>
      <MaintenanceRequestList initialData={initialRequests} key={listKey} />
    </Suspense>
  );
}
