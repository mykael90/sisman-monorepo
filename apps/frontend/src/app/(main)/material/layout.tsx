import { WarehouseProvider } from './choose-warehouse/context/warehouse-provider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/_options';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import Logger from '@/lib/logger';
import { getWarehouses } from '../warehouse/warehouse-actions';

const logger = new Logger(`src/app/(main)/material/withdrawal/layout.tsx`);

export default async function MaterialWithdrawalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // 1. Chama a Server Action no servidor
  if (!session?.user.maintenanceInstanceId) {
    return null;
  }

  const accessTokenSisman = await getSismanAccessToken();

  const warehousesForMaintenanceInstance = await getWarehouses(
    accessTokenSisman,
    { maintenanceInstanceId: session.user.maintenanceInstanceId }
  );

  const initialWarehouse = warehousesForMaintenanceInstance.find(
    (warehouse) => warehouse.defaultForInstance
  );

  if (!initialWarehouse) {
    logger.error(`Nenhum depósito padrão encontrado.`);
    return null;
  }

  return (
    <WarehouseProvider initialWarehouse={initialWarehouse}>
      <div className='bg-background min-h-screen'>
        <main>{children}</main>
      </div>
    </WarehouseProvider>
  );
}
