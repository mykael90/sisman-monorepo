import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, ClipboardList, Warehouse } from 'lucide-react';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';
import { MaterialRequestItemsTable } from './material-request-items';
import { MaterialRequestReceiptsList } from './material-request-receipt-list';
import { MaterialRequestPickingOrdersList } from './material-request-picking-orders-list';
import { MaterialRequestWithdrawalsList } from './material-request-withdrawal-list';
import { MaterialRequestRestrictions } from './material-request-restrictions';

interface MaterialRequestTabsProps {
  requestData: IMaterialRequestShowWithRelations;
}

export function MaterialRequestTabs({ requestData }: MaterialRequestTabsProps) {
  // Contagens para os badges nas abas
  const totalItems = requestData.items?.length || 0;
  const totalReceipts = requestData.materialReceipts?.length || 0;
  const totalPickingOrders = requestData.materialPickingOrders?.length || 0;
  const totalWithdrawals = requestData.materialWithdrawals?.length || 0;
  const hasRestriction = requestData.restrictionOrders ? '1' : '0';

  return (
    <Tabs defaultValue='materials' className='space-y-4'>
      {/* Lista de Navegação (Abas) */}
      <TabsList className='grid h-auto w-full grid-cols-1 md:grid-cols-5'>
        <TabsTrigger value='materials' className='flex items-center gap-2 py-2'>
          <Package className='h-4 w-4' />
          <span className='truncate'>Itens ({totalItems})</span>
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

        <TabsTrigger
          value='restrictions'
          className='flex items-center gap-2 py-2'
        >
          <Warehouse className='h-4 w-4' />
          <span className='truncate'>Restrição ({hasRestriction})</span>
        </TabsTrigger>
      </TabsList>

      {/* Conteúdo: Itens da Requisição */}
      <TabsContent value='materials' className='space-y-4 outline-none'>
        <MaterialRequestItemsTable items={requestData.items} />
      </TabsContent>

      {/* Conteúdo: Entradas (Receipts) */}
      <TabsContent value='receipts' className='space-y-4 outline-none'>
        <MaterialRequestReceiptsList receipts={requestData.materialReceipts} />
      </TabsContent>

      {/* Conteúdo: Reservas (Picking Orders) */}
      <TabsContent value='pickingOrders' className='space-y-4 outline-none'>
        <MaterialRequestPickingOrdersList
          pickingOrders={requestData.materialPickingOrders}
        />
      </TabsContent>

      {/* Conteúdo: Saídas (Withdrawals) */}
      <TabsContent value='withdrawals' className='space-y-4 outline-none'>
        <MaterialRequestWithdrawalsList
          withdrawals={requestData.materialWithdrawals}
        />
      </TabsContent>

      {/* Conteúdo: Restrições */}
      <TabsContent value='restrictions' className='space-y-4 outline-none'>
        <MaterialRequestRestrictions
          restrictionOrder={requestData.restrictionOrders}
        />
      </TabsContent>
    </Tabs>
  );
}
