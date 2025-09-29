import { WorkerListPage } from '@/src/app/(main)/worker/_components/list/worker-list'; // Alterado para WorkerListPage
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getRefreshedWorkers, getWorkers } from './worker-actions'; // Alterado para getRefreshedWorkers, getWorkers
import Logger from '@/lib/logger';
import Loading from '../../../components/loading';

const logger = new Logger('workers-management'); // Alterado para workers-management

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  const [initialWorkers] = await Promise.all([getWorkers(accessTokenSisman)]); // Alterado para initialWorkers, getWorkers

  const listKey = Date.now().toString() + Math.random().toString();

  return (
    // <Suspense fallback={<Loading />}>
    <WorkerListPage // Alterado para WorkerListPage
      initialWorkers={initialWorkers} // Passa a promise criada acima // Alterado para initialWorkers
      refreshAction={getRefreshedWorkers} // Passa a referência da função Server Action // Alterado para getRefreshedWorkers
      key={listKey} // Passa a string gerada como chave
    />
    // </Suspense>
  );
}
