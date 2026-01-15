import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMaintenanceRequestShowWithRelations } from '@/app/(main)/maintenance/request/maintenance-request-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IMaterialRequestItemWithRelations } from '@/app/(main)/material/request/material-request-types';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatOnlyDate } from '@/lib/utils';

interface MaintenanceRequestMaterialMovementProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestMaterialMovement({
  data
}: MaintenanceRequestMaterialMovementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Requisições de Materiais</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        {data.materialRequests && data.materialRequests.length > 0 ? (
          data.materialRequests.map((materialRequest, reqIndex) => (
            <Card key={reqIndex} className='overflow-hidden'>
              <CardHeader className='bg-gray-50'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <div>
                    <CardTitle className='text-md'>
                      Requisição de Material: {materialRequest.protocolNumber}
                    </CardTitle>
                    <p className='text-sm text-gray-500'>
                      ID: {materialRequest.id} &bull; Data:{' '}
                      {formatOnlyDate(materialRequest.requestDate)}
                    </p>
                  </div>
                  <div className='text-sm font-medium'>
                    Status: {materialRequest.currentStatus}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-4'>
                <Tabs defaultValue='items' className='w-full'>
                  <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='items'>
                      Requisições de Materiais
                    </TabsTrigger>
                    <TabsTrigger value='receipts'>Entradas</TabsTrigger>
                    <TabsTrigger value='pickingOrders'>Reservas</TabsTrigger>
                    <TabsTrigger value='withdrawals'>Saídas</TabsTrigger>
                  </TabsList>
                  <TabsContent value='items' className='mt-4'>
                    {materialRequest.items &&
                    materialRequest.items.length > 0 ? (
                      <div className='rounded-md border'>
                        <Table>
                          <TableHeader className='bg-gray-100'>
                            <TableRow>
                              <TableHead>Material</TableHead>
                              <TableHead>Qtd. Requisitada</TableHead>
                              <TableHead>Qtd. Aprovada</TableHead>
                              <TableHead>Valor Unitário</TableHead>
                              <TableHead>Total do Item</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {materialRequest.items.map(
                              (
                                item: IMaterialRequestItemWithRelations,
                                itemIndex: number
                              ) => {
                                const itemTotalPrice =
                                  Number(item.quantityRequested || 0) *
                                  Number(item.unitPrice || 0);
                                return (
                                  <TableRow
                                    key={itemIndex}
                                    className='hover:bg-gray-50'
                                  >
                                    <TableCell className='text-gray-900'>
                                      {item.requestedGlobalMaterial?.name}
                                    </TableCell>
                                    <TableCell className='text-gray-900'>
                                      {Number(
                                        item.quantityRequested
                                      ).toLocaleString()}
                                    </TableCell>
                                    <TableCell className='text-gray-900'>
                                      {Number(
                                        item.quantityApproved
                                      ).toLocaleString()}
                                    </TableCell>
                                    <TableCell className='text-gray-900'>
                                      {formatCurrency(item.unitPrice)}
                                    </TableCell>
                                    <TableCell className='text-gray-900'>
                                      {formatCurrency(itemTotalPrice)}
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>
                        Nenhum item de material encontrado para esta requisição.
                      </p>
                    )}
                    <div className='mt-4 grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 sm:grid-cols-4'>
                      <div className='text-center'>
                        <p className='text-xs font-medium text-gray-500'>
                          Total de Itens
                        </p>
                        <p className='text-sm font-semibold text-gray-900'>
                          {materialRequest.items?.length
                            ? materialRequest.items?.length
                            : 'Nenhum item'}
                        </p>
                      </div>
                      <div className='text-center'>
                        <p className='text-xs font-medium text-gray-500'>
                          Valor Total da Requisição
                        </p>
                        <p className='text-sm font-semibold text-gray-900'>
                          {formatCurrency(
                            materialRequest.items?.reduce(
                              (sum, item) =>
                                sum +
                                Number(item.quantityRequested || 0) *
                                  Number(item.unitPrice || 0),
                              0
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value='receipts' className='mt-4'>
                    {materialRequest.materialReceipts &&
                    materialRequest.materialReceipts.length > 0 ? (
                      <div className='space-y-4'>
                        {materialRequest.materialReceipts.map(
                          (receipt, receiptIndex) => (
                            <Card key={receiptIndex} className='p-4'>
                              <p className='font-semibold'>
                                Entrada #{receipt.receiptNumber}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Data: {formatDate(receipt.receiptDate)}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Processado por:{' '}
                                {receipt.processedByUser?.name ??
                                  'Não informado'}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Valor:{' '}
                                {Number(receipt.valueReceipt).toLocaleString(
                                  'pt-BR',
                                  { style: 'currency', currency: 'BRL' }
                                )}
                              </p>
                              {/* Adicionar mais detalhes da entrada se necessário */}
                              {receipt.items && receipt.items.length > 0 && (
                                <div className='mt-2 text-sm'>
                                  <p className='font-medium'>
                                    Itens da Entrada:
                                  </p>
                                  <ul className='list-disc pl-5'>
                                    {receipt.items.map((item, itemIndex) => (
                                      <li key={itemIndex}>
                                        {item.material?.name} - Qtd:{' '}
                                        {item.quantityReceived} - Valor
                                        Unitário:{' '}
                                        {Number(item.unitPrice).toLocaleString(
                                          'pt-BR',
                                          { style: 'currency', currency: 'BRL' }
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </Card>
                          )
                        )}
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>
                        Nenhuma entrada de material encontrada para esta
                        requisição.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value='pickingOrders' className='mt-4'>
                    {data.materialPickingOrders &&
                    data.materialPickingOrders.length > 0 ? (
                      <div className='space-y-4'>
                        {data.materialPickingOrders.map(
                          (pickingOrder, pickingIndex) => (
                            <Card key={pickingIndex} className='p-4'>
                              <p className='font-semibold'>
                                Reserva #{pickingOrder.pickingOrderNumber}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Data: {formatDate(pickingOrder.requestedAt)}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Solicitado por:{' '}
                                {pickingOrder.requestedByUser?.name ??
                                  'Não informado'}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Armazém:{' '}
                                {pickingOrder.warehouse?.name ??
                                  'Não informado'}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Valor:{' '}
                                {Number(
                                  pickingOrder.valuePickingOrder
                                ).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </p>
                              {pickingOrder.items &&
                                pickingOrder.items.length > 0 && (
                                  <div className='mt-2 text-sm'>
                                    <p className='font-medium'>
                                      Itens da Reserva:
                                    </p>
                                    <ul className='list-disc pl-5'>
                                      {pickingOrder.items.map(
                                        (item, itemIndex) => (
                                          <li key={itemIndex}>
                                            {item.globalMaterial?.name} - Qtd.
                                            Reservada: {item.quantityToPick}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </Card>
                          )
                        )}
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>
                        Nenhuma reserva de material encontrada para esta
                        requisição.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value='withdrawals' className='mt-4'>
                    {data.materialWithdrawals &&
                    data.materialWithdrawals.length > 0 ? (
                      <div className='space-y-4'>
                        {data.materialWithdrawals.map(
                          (withdrawal, withdrawalIndex) => (
                            <Card key={withdrawalIndex} className='p-4'>
                              <p className='font-semibold'>
                                Saída #{withdrawal.withdrawalNumber}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Data: {formatDate(withdrawal.withdrawalDate)}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Processado por:{' '}
                                {withdrawal.processedByUser?.name ??
                                  'Não informado'}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Retirado por:{' '}
                                {withdrawal.collectedByWorker?.name ??
                                  withdrawal.collectedByUser?.name ??
                                  'Não informado'}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Armazém:{' '}
                                {withdrawal.warehouse?.name ?? 'Não informado'}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                Valor:{' '}
                                {Number(
                                  withdrawal.valueWithdrawal
                                ).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </p>
                              {withdrawal.items &&
                                withdrawal.items.length > 0 && (
                                  <div className='mt-2 text-sm'>
                                    <p className='font-medium'>
                                      Itens da Saída:
                                    </p>
                                    <ul className='list-disc pl-5'>
                                      {withdrawal.items.map(
                                        (item, itemIndex) => (
                                          <li key={itemIndex}>
                                            {item.globalMaterial?.name} - Qtd.
                                            Retirada: {item.quantityWithdrawn}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </Card>
                          )
                        )}
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>
                        Nenhuma saída de material encontrada para esta
                        requisição.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className='text-muted-foreground'>
            Nenhuma movimentação de material associada a esta requisição de
            manutenção.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
