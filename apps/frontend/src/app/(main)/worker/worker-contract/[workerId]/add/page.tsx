import { getSismanAccessToken } from '../../../../../../lib/auth/get-access-token';
import { getContracts } from '../../../../contract/contract-actions';
import { getWorkerSpecialties } from '../../../../worker-specialty/worker-specialty-actions';
import WorkerContractAdd from '../_components/add/worker-contract-add';
import { showWorker } from '../../../worker-actions';

export default async function WorkerContractAddPage({
  params,
  isInDialog = false
}: {
  params: Promise<{ workerId: number }>;
  isInDialog?: boolean;
}) {
  const { workerId } = await params;

  console.log('workerId', workerId);

  const accessTokenSisman = await getSismanAccessToken();
  const [worker, listSpecialities, listContracts] = await Promise.all([
    showWorker(workerId, accessTokenSisman),
    getWorkerSpecialties(accessTokenSisman),
    getContracts(accessTokenSisman)
  ]);

  return (
    <WorkerContractAdd
      isInDialog={isInDialog}
      worker={worker}
      relatedData={{ listSpecialities, listContracts }}
    />
  );
}
