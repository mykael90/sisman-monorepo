import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { getMaintenanceInstances } from '../../maintenance/instance/maintenance-instance-actions';
import { IMaintenanceInstanceList } from '../../maintenance/instance/maintenance-instance-types';
import { WarehouseAdd } from '../_components/add/warehouse-add';

export default async function Page({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const accessTokenSisman = await getSismanAccessToken();
  const [listMaitenanceInstances]: [IMaintenanceInstanceList[]] =
    await Promise.all([getMaintenanceInstances(accessTokenSisman)]);
  return (
    <WarehouseAdd
      relatedData={{ listMaitenanceInstances }}
      isInDialog={isInDialog}
    />
  );
}
