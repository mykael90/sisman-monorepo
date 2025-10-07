import { WorkerManualFrequencyListPage } from '@/src/app/(main)/worker-manual-frequency/_components/list/worker-manual-frequency-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import {
  getRefreshedWorkerManualFrequencies,
  getWorkerManualFrequencies,
  getWorkerManualFrequenciesWithContracts
} from './worker-manual-frequency-actions';
import Logger from '@/lib/logger';
import Loading from '../../../components/loading';

const logger = new Logger('worker-manual-frequencies-management');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  const [initialWorkerManualFrequencies] = await Promise.all([
    getWorkerManualFrequenciesWithContracts()
  ]);

  const listKey = Date.now().toString() + Math.random().toString();

  return (
    <Suspense fallback={<Loading />}>
      <WorkerManualFrequencyListPage
        initialWorkerManualFrequencies={initialWorkerManualFrequencies}
        refreshAction={getRefreshedWorkerManualFrequencies}
        key={listKey}
      />
    </Suspense>
  );
}
