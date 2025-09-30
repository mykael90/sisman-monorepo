import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import {
  getRefreshedWorkerSpecialties,
  getWorkerSpecialties
} from './worker-specialty-actions';
import Logger from '@/lib/logger';
import { WorkerSpecialtyListPage } from './_components/list/worker-specialty-list';

const logger = new Logger('worker-specialty-management');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  // Fetch the initial list of worker specialties
  const [initialWorkerSpecialties] = await Promise.all([
    getWorkerSpecialties(accessTokenSisman)
  ]);

  // Generate a unique key for this render to force component reset on revalidation
  const listKey = Date.now().toString() + Math.random().toString();

  return (
    <WorkerSpecialtyListPage
      initialWorkerSpecialties={initialWorkerSpecialties}
      refreshAction={getRefreshedWorkerSpecialties}
      key={listKey}
    />
  );
}
