import { Suspense } from 'react';
import Loading from '@/components/loading';
// import { MaterialDeficitReport } from './_components/material-deficit-report';
// import { getMaintenanceInstances } from '../../../instance/maintenance-instance-actions';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { MaterialDeficitList } from './_components/material-defict-list';

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MaterialDeficitList></MaterialDeficitList>
    </Suspense>
  );
}
