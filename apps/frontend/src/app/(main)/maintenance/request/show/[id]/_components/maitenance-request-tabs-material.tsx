import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, ClipboardList, Warehouse } from 'lucide-react';
import { MaterialRequestItemsTable } from '../../../../../material/request/_components/show/material-request-items';
import { MaterialRequestReceiptsList } from '../../../../../material/request/_components/show/material-request-receipt-list';
import { MaterialRequestPickingOrdersList } from '../../../../../material/request/_components/show/material-request-picking-orders-list';
import { MaterialRequestWithdrawalsList } from '../../../../../material/request/_components/show/material-request-withdrawal-list';
import { IMaintenanceRequestShowWithRelations } from '../../../maintenance-request-types';
import { MaintenanceRequestMaterialRequestsList } from './maintenance-request-material-requests-list';

interface MaintenanceRequestTabsProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestMaterialTabs({
  data
}: MaintenanceRequestTabsProps) {
  // Contagens para os badges nas abas
  const requestItems = data.materialRequests?.length || 0;
  const totalReceipts =
    data.materialRequests.map((mr) => mr.materialReceipts).flat().length || 0;
  const totalPickingOrders = data.materialPickingOrders?.length || 0;
  const totalWithdrawals = data.materialWithdrawals?.length || 0;
  //   const hasRestriction = data.restrictionOrders ? '1' : '0';

  return (
    <Tabs defaultValue='materials' className='space-y-4'>
      {/* Lista de Navegação (Abas) */}
      <TabsList className='grid h-auto w-full grid-cols-1 md:grid-cols-4'>
        <TabsTrigger value='materials' className='flex items-center gap-2 py-2'>
          <Package className='h-4 w-4' />
          <span className='truncate'>
            Requisições de Materiais ({requestItems})
          </span>
        </TabsTrigger>

        <TabsTrigger value='receipts' className='flex items-center gap-2 py-2'>
          <Truck className='h-4 w-4' />
          <span className='truncate'>Entradas ({totalReceipts})</span>
        </TabsTrigger>

        <TabsTrigger
          value='pickingOrders'
          className='flex items-center gap-2 py-2'
        >
          <ClipboardList className='h-4 w-4' />
          <span className='truncate'>Reservas ({totalPickingOrders})</span>
        </TabsTrigger>

        <TabsTrigger
          value='withdrawals'
          className='flex items-center gap-2 py-2'
        >
          <Truck className='h-4 w-4 -scale-x-100' />
          <span className='truncate'>Saídas ({totalWithdrawals})</span>
        </TabsTrigger>

        {/* <TabsTrigger
          value='restrictions'
          className='flex items-center gap-2 py-2'
        >
          <Warehouse className='h-4 w-4' />
          <span className='truncate'>Restrição ({hasRestriction})</span>
        </TabsTrigger> */}
      </TabsList>

      {/* Conteúdo: Requisições de Materiais */}
      <TabsContent value='materials' className='space-y-4 outline-none'>
        <MaintenanceRequestMaterialRequestsList
          materialRequests={data.materialRequests}
        />
      </TabsContent>

      {/* Conteúdo: Entradas (Receipts) */}
      <TabsContent value='receipts' className='space-y-4 outline-none'>
        <MaterialRequestReceiptsList
          receipts={data.materialRequests
            .map((mr) => mr.materialReceipts)
            .flat()}
        />
      </TabsContent>

      {/* Conteúdo: Reservas (Picking Orders) */}
      <TabsContent value='pickingOrders' className='space-y-4 outline-none'>
        <MaterialRequestPickingOrdersList
          pickingOrders={data.materialPickingOrders}
        />
      </TabsContent>

      {/* Conteúdo: Saídas (Withdrawals) */}
      <TabsContent value='withdrawals' className='space-y-4 outline-none'>
        <MaterialRequestWithdrawalsList
          withdrawals={data.materialWithdrawals}
        />
      </TabsContent>

      {/* Conteúdo: Restrições */}
      {/* <TabsContent value='restrictions' className='space-y-4 outline-none'>
        <MaterialRequestRestrictions
          restrictionOrder={data.restrictionOrders}
        />
      </TabsContent> */}
    </Tabs>
  );
}
