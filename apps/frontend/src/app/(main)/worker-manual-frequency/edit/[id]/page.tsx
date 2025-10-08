import WorkerManualFrequencyEdit from '../../_components/edit/worker-manual-frequency-edit';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import {
  showWorkerManualFrequency,
  getWorkerManualFrequencyTypes
} from '../../worker-manual-frequency-actions';
import { getWorkers } from '../../../worker/worker-actions';
import { getUsers } from '../../../user/user-actions';

export default async function WorkerManualFrequencyEditPage({
  params,
  isInDialog = false
}: {
  params: Promise<{ id: number }>;
  isInDialog?: boolean;
}) {
  const { id } = await params;
  const accessTokenSisman = await getSismanAccessToken();

  const [
    initialWorkerManualFrequency,
    listWorkers,
    listWorkerManualFrequencyTypes,
    listUsers
  ] = await Promise.all([
    showWorkerManualFrequency(id, accessTokenSisman),
    getWorkers(accessTokenSisman),
    getWorkerManualFrequencyTypes(accessTokenSisman),
    getUsers(accessTokenSisman)
  ]);

  return (
    <WorkerManualFrequencyEdit
      initialWorkerManualFrequency={initialWorkerManualFrequency}
      relatedData={{
        listWorkers,
        listWorkerManualFrequencyTypes,
        listUsers
      }}
      isInDialog={isInDialog}
    />
  );
}
