import MaintenanceInstanceEdit from '../../_components/edit/maintenance-instance-edit';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { showInstance } from '../../instance-actions';
import { IMaintenanceInstanceEdit } from '../../maintenance-instance-types';
import { removeUnreferencedKeys } from '../../../../../../lib/form-utils';

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
  const initialInstance: IMaintenanceInstanceEdit = await showInstance(
    accessTokenSisman,
    Number(id)
  );

  return (
    <MaintenanceInstanceEdit
      initialInstance={initialInstance}
      isInDialog={isInDialog}
    />
  );
}
