import { getSismanAccessToken } from '../../../../../../../lib/auth/get-access-token';
import { getContracts } from '../../../../../contract/contract-actions';
import { getWorkerSpecialties } from '../../../../../worker-specialty/worker-specialty-actions';
import { showWorker } from '../../../../worker-actions';
import { showWorkerContract } from '../../../worker-contract-actions';
import WorkerContractEdit from '../../_components/edit/worker-contract-edit';

export default async function WorkerContractEditPage({
  params,
  isInDialog = false
}: {
  params: Promise<{ workerId: number; id: number }>;
  isInDialog?: boolean;
}) {
  const { id, workerId } = await params;

  console.log('workerId', workerId);
  console.log('id', id);

  const accessTokenSisman = await getSismanAccessToken();
  const [initialWorkerContract, worker, listSpecialities, listContracts] =
    await Promise.all([
      showWorkerContract(id, accessTokenSisman),
      showWorker(workerId, accessTokenSisman),
      getWorkerSpecialties(accessTokenSisman),
      getContracts(accessTokenSisman)
    ]);

  return (
    <WorkerContractEdit
      initialWorkerContract={initialWorkerContract}
      isInDialog={isInDialog}
      worker={worker}
      relatedData={{ listSpecialities, listContracts }}
    />
  );
}
