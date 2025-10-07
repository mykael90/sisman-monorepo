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

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <WorkerManualFrequencyListPage />
    </Suspense>
  );
}
