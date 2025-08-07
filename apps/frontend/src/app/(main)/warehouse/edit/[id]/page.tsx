import { WarehouseEdit } from '../../_components/edit/warehouse-edit';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { showWarehouse } from '../../warehouse-actions';
import { notFound } from 'next/navigation';
import { IWarehouseEdit } from '../../warehouse-types';

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
  const initialWarehouse: IWarehouseEdit = await showWarehouse(
    accessTokenSisman,
    Number(id)
  );

  if (!initialWarehouse) {
    return notFound();
  }

  return (
    <WarehouseEdit
      initialWarehouse={initialWarehouse}
      isInDialog={isInDialog}
    />
  );
}
