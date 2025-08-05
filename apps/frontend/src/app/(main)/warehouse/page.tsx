import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getWarehouses, getRefreshedWarehouses } from './warehouse-actions';
import { WarehouseListPage } from './_components/list/warehouse-list';

export default async function Page() {
  const accessToken = await getSismanAccessToken();
  const initialWarehouses = await getWarehouses(accessToken);

  return (
    <WarehouseListPage
      initialWarehouses={initialWarehouses}
      refreshAction={getRefreshedWarehouses}
    />
  );
}
