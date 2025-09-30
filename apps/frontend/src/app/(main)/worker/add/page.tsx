import WorkerAdd from '../_components/add/worker-add';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import Logger from '@/lib/logger';
import { getRoles } from '../../role/role-actions';
import { getMaintenanceInstances } from '../../maintenance/instance/instance-actions';
import { getContracts } from '../../contract/contract-actions';
import { getWorkersSpecialties } from '../worker-actions';
import { getSipacUnidades } from '../../sipac/unidade/unidade-actions';

const logger = new Logger('worker/add/page.tsx');

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const accessTokenSisman = await getSismanAccessToken();
  const [
    listMaintenanceInstances,
    listContracts,
    listWorkerSpecialties,
    listSipacUnidades
  ] = await Promise.all([
    getMaintenanceInstances(accessTokenSisman),
    getContracts(accessTokenSisman),
    getWorkersSpecialties(accessTokenSisman),
    getSipacUnidades(accessTokenSisman)
  ]);

  return (
    <WorkerAdd
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
