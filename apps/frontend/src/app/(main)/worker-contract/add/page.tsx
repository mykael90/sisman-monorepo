import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { getContracts } from '../../contract/contract-actions';
import { getSipacUnidades } from '../../sipac/unidade/unidade-actions';
import { getWorkerSpecialties } from '../../worker-specialty/worker-specialty-actions';
import WorkerContractAdd from '../_components/add/worker-contract-add';
import { getWorkerContracts } from '../worker-contract-actions';

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const worker = {
    id: 50,
    name: 'JUSSIER DO NASCIMENTO AIRES',
    email: null,
    birthdate: null,
    urlPhoto: null,
    rg: null,
    cpf: null,
    phone: null,
    isActive: true,
    notes: null,
    maintenanceInstanceId: 1,
    createdAt: new Date('2022-10-11T16:42:00.000-03:00'),
    updatedAt: new Date('2022-10-11T16:42:00.000-03:00')
  };

  const accessTokenSisman = await getSismanAccessToken();
  const [listSpecialities, listContracts] = await Promise.all([
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
  // return <div className='text-center'>TESTE</div>;
}
