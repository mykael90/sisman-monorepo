import { Suspense } from 'react';
import Loading from '@/components/loading';
// import { MaterialDeficitReport } from './_components/material-deficit-report';
// import { getMaintenanceInstances } from '../../../instance/maintenance-instance-actions';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { MateriallDeficitList } from './_components/material-deficit-list';

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MateriallDeficitList></MateriallDeficitList>
    </Suspense>
  );
}
