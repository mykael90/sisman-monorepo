import { Warehouse } from 'lucide-react';
import { WarehouseSelector } from './components/warehouse-selector';
import { TabSelector } from './components/tab-selector';
import {
  getDefaultWarehouseId,
  getWarehouses
} from '../../warehouse/warehouse-actions';
import { WarehouseProvider } from './context/warehouse-provider';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/_options';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { get } from 'http';
import Logger from '../../../../lib/logger';

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

  // const initialWarehouse = await getWarehouses(accessTokenSisman, {
  //   maintenanceInstanceId: session.user.maintenanceInstanceId,
  //   defaultForInstance: true
  // });

  const warehousesForMaintenanceInstance = await getWarehouses(
    accessTokenSisman,
    { maintenanceInstanceId: session.user.maintenanceInstanceId }
  );

  const initialWarehouseId = warehousesForMaintenanceInstance.find(
    (warehouse) => warehouse.defaultForInstance
  )?.id;

  if (!initialWarehouseId) {
    logger.error(`Nenhum depósito padrão encontrado.`);
    return null;
  }

  return (
    <WarehouseProvider initialWarehouseId={initialWarehouseId}>
      <div className='bg-background min-h-screen'>
        {/* Secondary Navbar (Page-specific Header) */}
        <div className='border-primary-foreground/10 bg-primary/80 text-primary-foreground sticky top-0 z-10 border-b p-4 backdrop-blur-sm'>
          <div className='mx-auto flex max-w-7xl items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Warehouse className='h-8 w-8' />
              <h1 className='text-2xl font-semibold'>
                Saída de Material de Depósito Provisório
              </h1>
            </div>
            <WarehouseSelector
              warehousesForMaintenanceInstance={
                warehousesForMaintenanceInstance
              }
            />
          </div>
        </div>
        <div className='mx-auto max-w-7xl space-y-6 p-4'>
          {/* Output Type Tabs */}
          <TabSelector />
          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </WarehouseProvider>
  );
}
