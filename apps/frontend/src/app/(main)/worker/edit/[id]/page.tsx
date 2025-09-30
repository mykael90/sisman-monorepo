import WorkerEdit from '../../_components/edit/worker-edit';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getWorkersSpecialties, showWorker } from '../../worker-actions';
import { getMaintenanceInstances } from '../../../maintenance/instance/instance-actions';
import { getContracts } from '../../../contract/contract-actions';
import { getSipacUnidades } from '../../../sipac/unidade/unidade-actions';

export default async function Page({
  params,
  isInDialog = false
}: {
  params: Promise<{ id: number }>;
  isInDialog?: boolean;
}) {
  const { id } = await params;
  const accessTokenSisman = await getSismanAccessToken();

  const [
    initialWorker,
    listMaintenanceInstances,
    listContracts,
    listWorkerSpecialties,
    listSipacUnidades
  ] = await Promise.all([
    showWorker(id, accessTokenSisman),
    getMaintenanceInstances(accessTokenSisman),
    getContracts(accessTokenSisman),
    getWorkersSpecialties(accessTokenSisman),
    getSipacUnidades(accessTokenSisman)
  ]);

  return (
    <WorkerEdit
      initialWorker={initialWorker}
      relatedData={{
        listMaintenanceInstances,
        listContracts,
        listWorkerSpecialties,
        listSipacUnidades
      }}
      isInDialog={isInDialog}
    />
  );
}
