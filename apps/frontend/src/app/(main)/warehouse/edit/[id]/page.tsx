import { WarehouseEdit } from '../../_components/edit/warehouse-edit';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { showWarehouse } from '../../warehouse-actions';
import { notFound } from 'next/navigation';
import { IWarehouseEdit } from '../../warehouse-types';
import { getMaintenanceInstances } from '../../../maintenance/instance/maintenance-instance-actions';
import { IMaintenanceInstanceList } from '../../../maintenance/instance/maintenance-instance-types';

export default async function Page({
  params,
  isInDialog = false
}: {
  params: Promise<{ id: string }>; // params is a Promise
  isInDialog?: boolean;
}) {
  const { id } = await params; // Await params to get the id
  const accessTokenSisman = await getSismanAccessToken();
  // Fetch the specific instance data
  const [initialWarehouse, listMaitenanceInstances]: [
    IWarehouseEdit,
    IMaintenanceInstanceList[]
  ] = await Promise.all([
    showWarehouse(accessTokenSisman, Number(id)),
    getMaintenanceInstances(accessTokenSisman)
  ]);

  if (!initialWarehouse || !listMaitenanceInstances) {
    return notFound();
  }

  return (
    <WarehouseEdit
      initialWarehouse={initialWarehouse}
      isInDialog={isInDialog}
      relatedData={{ listMaitenanceInstances }}
    />
  );
}
