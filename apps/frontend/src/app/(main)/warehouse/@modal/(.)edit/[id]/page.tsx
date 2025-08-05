import { WarehouseEdit } from '../../../_components/edit/warehouse-edit';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { showWarehouse } from '../../../warehouse-actions';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const accessToken = await getSismanAccessToken();
  const warehouse = await showWarehouse(accessToken, Number(params.id));

  if (!warehouse) {
    return notFound();
  }

  return <WarehouseEdit warehouse={warehouse} />;
}
