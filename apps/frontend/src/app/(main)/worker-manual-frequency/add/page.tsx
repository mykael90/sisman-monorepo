import WorkerManualFrequencyAdd from '../_components/add/worker-manual-frequency-add';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import Logger from '@/lib/logger';
import { getWorkers } from '../../worker/worker-actions';
import { getWorkerManualFrequencyTypes } from '../worker-manual-frequency-actions';
import { getUsers } from '../../user/user-actions';

const logger = new Logger('worker-manual-frequency/add/page.tsx');

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
    <WorkerManualFrequencyAdd
      relatedData={{
        listWorkers,
        listWorkerManualFrequencyTypes,
        listUsers
      }}
      isInDialog={isInDialog}
    />
    // <>
    //   {/* <div className='bg-red-300'>{JSON.stringify(listWorkers, null, 2)}</div> */}
    //   <div className='bg-green-300'>
    //     {JSON.stringify(listWorkerManualFrequencyTypes, null, 2)}
    //   </div>
    //   <div className='bg-blue-300'>{JSON.stringify(listUsers, null, 2)}</div>
    // </>
  );
}
