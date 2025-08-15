import UserAdd from '../_components/add/user-add';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import Logger from '@/lib/logger';
import { getRoles } from '../../role/role-actions';
import { getMaintenanceInstances } from '../../maintenance/instance/instance-actions';

const logger = new Logger('user/add/page.tsx');

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const accessTokenSisman = await getSismanAccessToken();
  const [listRoles, listMaintenanceInstances] = await Promise.all([
    getRoles(accessTokenSisman),
    getMaintenanceInstances(accessTokenSisman)
  ]);

  return (
    <UserAdd
      relatedData={{ listRoles, listMaintenanceInstances }}
      isInDialog={isInDialog}
    />
  );
}
