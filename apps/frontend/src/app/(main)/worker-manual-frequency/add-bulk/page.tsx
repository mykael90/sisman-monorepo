import { Suspense } from 'react';
import Loading from '../../../../components/loading';
import WorkerManualFrequencyAddBulk from '../_components/add-bulk/worker-manual-frequency-add-bulk';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { getWorkersWithActiveContract } from '../../worker/worker-actions';
import { getWorkerManualFrequencyTypes } from '../worker-manual-frequency-actions';
import { getUsers } from '../../user/user-actions';

export default async function WorkerManualFrequencyAddBulkPage({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const accessTokenSisman = await getSismanAccessToken();
  const [listWorkers, listWorkerManualFrequencyTypes, listUsers] =
    await Promise.all([
      getWorkersWithActiveContract(),
      getWorkerManualFrequencyTypes(accessTokenSisman),
      getUsers(accessTokenSisman)
    ]);
  return (
    <Suspense fallback={<Loading />}>
      <div className='container mx-auto p-4'>
        <WorkerManualFrequencyAddBulk
          relatedData={{
            listWorkers,
            listWorkerManualFrequencyTypes,
            listUsers
          }}
          isInDialog={isInDialog}
        />
      </div>
    </Suspense>
  );
}
