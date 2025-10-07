import { Suspense } from 'react';
import Loading from '../../../../components/loading';
import WorkerManualFrequencyAddBulk from '../_components/add-bulk/worker-manual-frequency-add-bulk';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { getWorkers } from '../../worker/worker-actions';
import { getWorkerManualFrequencyTypes } from '../worker-manual-frequency-actions';
import { getUsers } from '../../user/user-actions';

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const accessTokenSisman = await getSismanAccessToken();
  const [listWorkers, listWorkerManualFrequencyTypes, listUsers] =
    await Promise.all([
      getWorkers(accessTokenSisman),
      getWorkerManualFrequencyTypes(accessTokenSisman),
      getUsers(accessTokenSisman)
    ]);
  return (
    <Suspense fallback={<Loading />}>
      <WorkerManualFrequencyAddBulk
        relatedData={{
          listWorkers,
          listWorkerManualFrequencyTypes,
          listUsers
        }}
        isInDialog={isInDialog}
      />
    </Suspense>
  );
}
