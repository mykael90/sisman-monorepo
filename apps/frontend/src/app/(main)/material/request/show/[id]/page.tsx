import { notFound } from 'next/navigation';
import { showRequest } from '@/app/(main)/material/request/material-request-actions';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Warehouse,
  ClipboardList,
  User,
  FileText,
  BarChart3,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MaterialRequestShowPageProps {
  params: {
    id: string;
  };
}

// Função para formatar status
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    REGISTERED: 'Registrada',
    APPROVED: 'Aprovada',
    FORWARDED: 'Encaminhada',
    FULLY_ATTENDED: 'Totalmente Atendida',
    PARTIALLY_ATTENDED: 'Parcialmente Atendida',
    CANCELLED: 'Cancelada'
  };
  return statusMap[status] || status;
};

// Função para formatar tipo de requisição
const formatRequestType = (type: string) => {
  const typeMap: Record<string, string> = {
    NEW_MATERIALS: 'Materiais Novos',
    REPLACEMENT: 'Reposição',
    OTHER: 'Outro'
  };
  return typeMap[type] || type;
};

// Função para formatar propósito
const formatPurpose = (purpose: string) => {
  const purposeMap: Record<string, string> = {
    SUPPLY_MAINTENANCE: 'Suprimento de Manutenção',
    STOCK_REPLENISHMENT: 'Reabastecimento de Estoque',
    PROJECT: 'Projeto',
    OTHER: 'Outro'
  };
  return purposeMap[purpose] || purpose;
};

// Função para formatar origem
const formatOrigin = (origin: string) => {
  const originMap: Record<string, string> = {
    SIPAC: 'SIPAC',
    INTERNAL: 'Interna',
    EXTERNAL: 'Externa'
  };
  return originMap[origin] || origin;
};

export default async function MaterialRequestShowPage({
  params
}: MaterialRequestShowPageProps) {
  const id = Number(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const materialRequestData: IMaterialRequestShowWithRelations | null =
    await showRequest(id);

  if (!materialRequestData) {
    notFound();
  }

  const formatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) {
      return '-';
    }
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return String(dateInput);
    }
  };

  const formatCurrency = (value: string | number | null | undefined | any) => {
    if (!value) return 'R$ 0,00';

    let numValue: number;
    if (typeof value === 'string') {
      numValue = parseFloat(value);
    } else if (typeof value === 'number') {
      numValue = value;
    } else if (value && typeof value === 'object' && 'toNumber' in value) {
      // Handle Decimal type from Prisma
      numValue = Number(value);
    } else {
      numValue = Number(value);
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  // Calcular totais dos itens
  const totalItems = materialRequestData.items?.length || 0;
  const totalRequestValue =
    materialRequestData.items?.reduce(
      (sum, item) =>
        sum + Number(item.quantityRequested) * Number(item.unitPrice || 0),
      0
    ) || 0;

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Cabeçalho com informações principais */}
      <Card>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-2xl'>
              <ClipboardList className='h-6 w-6' />
              Requisição de Material: {materialRequestData.protocolNumber}
            </CardTitle>
            <div className='mt-2 flex flex-wrap gap-2'>
              <Badge variant='secondary' className='text-sm'>
                Status: {formatStatus(materialRequestData.currentStatus)}
              </Badge>
              <Badge variant='outline' className='text-sm'>
                Tipo: {formatRequestType(materialRequestData.requestType)}
              </Badge>
              <Badge variant='outline' className='text-sm'>
                Origem: {formatOrigin(materialRequestData.origin)}
              </Badge>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground text-sm'>
              ID: {materialRequestData.id}
            </p>
            <p className='text-muted-foreground text-sm'>
              Criada em: {formatDate(materialRequestData.createdAt)}
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Informações básicas em grid */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Data da Requisição
              </Label>
              <p className='text-muted-foreground'>
                {formatDate(materialRequestData.requestDate)}
              </p>
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                Solicitante
              </Label>
              <p className='text-muted-foreground'>
                {materialRequestData.sipacUnitRequesting?.nomeUnidade ||
                  'Não informado'}
                {materialRequestData.sipacUserLoginRequest && (
                  <span className='text-muted-foreground block text-xs'>
                    Login: {materialRequestData.sipacUserLoginRequest}
                  </span>
                )}
              </p>
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <Building className='h-4 w-4' />
                Unidade de Custeio
              </Label>
              <p className='text-muted-foreground'>
                {materialRequestData.sipacUnitCost?.nomeUnidade ||
                  'Não informado'}
                {materialRequestData.sipacUnitCost?.sigla && (
                  <span className='text-muted-foreground block text-xs'>
                    Sigla: {materialRequestData.sipacUnitCost.sigla}
                  </span>
                )}
              </p>
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4' />
                Valor Total
              </Label>
              <p className='text-primary text-lg font-semibold'>
                {formatCurrency(
                  materialRequestData.requestValue || totalRequestValue
                )}
              </p>
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                Finalidade
              </Label>
              <p className='text-muted-foreground'>
                {formatPurpose(materialRequestData.purpose)}
              </p>
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <Warehouse className='h-4 w-4' />
                Armazém
              </Label>
              <p className='text-muted-foreground'>
                Armazém {materialRequestData.storageId || 'Não informado'}
              </p>
            </div>
          </div>

          {/* Justificativa e Observações */}
          {materialRequestData.justification && (
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Justificativa
              </Label>
              <p className='text-muted-foreground whitespace-pre-wrap'>
                {materialRequestData.justification}
              </p>
            </div>
          )}

          {materialRequestData.notes && (
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Observações
              </Label>
              <p className='text-muted-foreground whitespace-pre-wrap'>
                {materialRequestData.notes}
              </p>
            </div>
          )}

          {/* Requisição de Manutenção Vinculada */}
          {materialRequestData.maintenanceRequest && (
            <div className='space-y-2 rounded-lg border p-4'>
              <Label className='flex items-center gap-2 text-lg'>
                <Building className='h-5 w-5' />
                Requisição de Manutenção Vinculada
              </Label>
              <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                <div>
                  <p className='text-sm font-medium'>Protocolo:</p>
                  <p className='text-muted-foreground'>
                    {materialRequestData.maintenanceRequest.protocolNumber}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Edificação:</p>
                  <p className='text-muted-foreground'>
                    {materialRequestData.maintenanceRequest.building?.name ||
                      'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abas para diferentes seções */}
      <Tabs defaultValue='materials' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='materials' className='flex items-center gap-2'>
            <Package className='h-4 w-4' />
            Materiais ({totalItems})
          </TabsTrigger>
          <TabsTrigger value='receipts' className='flex items-center gap-2'>
            <Truck className='h-4 w-4' />
            Entradas ({materialRequestData.materialReceipts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value='restrictions' className='flex items-center gap-2'>
            <Warehouse className='h-4 w-4' />
            Reservas (1)
          </TabsTrigger>
          <TabsTrigger value='withdrawals' className='flex items-center gap-2'>
            <Truck className='h-4 w-4 rotate-180' />
            Saídas ({materialRequestData.materialWithdrawals?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Aba de Materiais */}
        <TabsContent value='materials' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Itens da Requisição</CardTitle>
            </CardHeader>
            <CardContent>
              {materialRequestData.items &&
              materialRequestData.items.length > 0 ? (
                <div className='overflow-x-auto rounded-lg border'>
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-100'>
                      <tr>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Material
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Código
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Unidade
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Qtd. Requisitada
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Qtd. Aprovada
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Valor Unitário
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Total do Item
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {materialRequestData.items.map((item, index) => {
                        const itemTotal =
                          Number(item.quantityRequested) *
                          Number(item.unitPrice);
                        return (
                          <tr key={item.id} className='hover:bg-gray-50'>
                            <td className='px-4 py-3'>
                              <div>
                                <p className='font-medium'>
                                  {item.requestedGlobalMaterial?.name}
                                </p>
                                {item.requestedGlobalMaterial?.description && (
                                  <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                                    {item.requestedGlobalMaterial.description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className='px-4 py-3'>
                              {item.requestedGlobalMaterial?.id || '-'}
                            </td>
                            <td className='px-4 py-3'>
                              {item.requestedGlobalMaterial?.unitOfMeasure ||
                                '-'}
                            </td>
                            <td className='px-4 py-3'>
                              {Number(item.quantityRequested).toLocaleString()}
                            </td>
                            <td className='px-4 py-3'>
                              {Number(item.quantityApproved).toLocaleString()}
                            </td>
                            <td className='px-4 py-3'>
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className='px-4 py-3 font-medium'>
                              {formatCurrency(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className='bg-gray-50'>
                      <tr>
                        <td
                          colSpan={6}
                          className='px-4 py-3 text-right font-medium'
                        >
                          Total Geral:
                        </td>
                        <td className='text-primary px-4 py-3 font-bold'>
                          {formatCurrency(totalRequestValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className='text-muted-foreground py-8 text-center'>
                  Nenhum item cadastrado nesta requisição.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Entradas (Receipts) */}
        <TabsContent value='receipts' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Entradas de Materiais</CardTitle>
            </CardHeader>
            <CardContent>
              {materialRequestData.materialReceipts &&
              materialRequestData.materialReceipts.length > 0 ? (
                <div className='space-y-4'>
                  {materialRequestData.materialReceipts.map((receipt) => (
                    <Card key={receipt.id} className='overflow-hidden'>
                      <CardHeader className='bg-gray-50 py-3'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                          <div>
                            <CardTitle className='text-sm'>
                              Recibo: {receipt.receiptNumber}
                            </CardTitle>
                            <p className='text-sm text-gray-500'>
                              Data: {formatDate(receipt.receiptDate)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              receipt.status === 'FULLY_ACCEPTED'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {receipt.status === 'FULLY_ACCEPTED'
                              ? 'Totalmente Aceito'
                              : receipt.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className='p-4'>
                        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Valor Total
                            </p>
                            <p className='font-medium'>
                              {formatCurrency(receipt.valueReceipt)}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Armazém Destino
                            </p>
                            <p className='font-medium'>
                              Armazém {receipt.destinationWarehouseId}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Processado por
                            </p>
                            <p className='font-medium'>
                              Usuário {receipt.processedByUserId}
                            </p>
                          </div>
                        </div>
                        {receipt.notes && (
                          <div className='mt-4 border-t pt-4'>
                            <p className='text-xs font-medium text-gray-500'>
                              Observações
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              {receipt.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground py-8 text-center'>
                  Nenhuma entrada registrada para esta requisição.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Reservas (Restrictions) */}
        <TabsContent value='restrictions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Reservas de Materiais</CardTitle>
            </CardHeader>
            <CardContent>
              {materialRequestData.restrictionOrders ? (
                <Card className='overflow-hidden'>
                  <CardHeader className='bg-gray-50 py-3'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div>
                        <CardTitle className='text-sm'>
                          Ordem de Restrição:{' '}
                          {
                            materialRequestData.restrictionOrders
                              .restrictionOrderNumber
                          }
                        </CardTitle>
                        <p className='text-sm text-gray-500'>
                          Processada em:{' '}
                          {formatDate(
                            materialRequestData.restrictionOrders.processedAt
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          materialRequestData.restrictionOrders.status ===
                          'FREE'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {materialRequestData.restrictionOrders.status === 'FREE'
                          ? 'Livre'
                          : materialRequestData.restrictionOrders.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='p-4'>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                      <div>
                        <p className='text-xs font-medium text-gray-500'>
                          Armazém
                        </p>
                        <p className='font-medium'>
                          Armazém{' '}
                          {materialRequestData.restrictionOrders.warehouseId}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-500'>
                          Processado por
                        </p>
                        <p className='font-medium'>
                          Usuário{' '}
                          {
                            materialRequestData.restrictionOrders
                              .processedByUserId
                          }
                        </p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-500'>
                          Status
                        </p>
                        <p className='font-medium'>
                          {materialRequestData.restrictionOrders.status}
                        </p>
                      </div>
                    </div>
                    {materialRequestData.restrictionOrders.notes && (
                      <div className='mt-4 border-t pt-4'>
                        <p className='text-xs font-medium text-gray-500'>
                          Observações
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          {materialRequestData.restrictionOrders.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <p className='text-muted-foreground py-8 text-center'>
                  Nenhuma reserva registrada para esta requisição.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Saídas (Withdrawals) */}
        <TabsContent value='withdrawals' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Saídas de Materiais</CardTitle>
            </CardHeader>
            <CardContent>
              {materialRequestData.materialWithdrawals &&
              materialRequestData.materialWithdrawals.length > 0 ? (
                <div className='space-y-4'>
                  {materialRequestData.materialWithdrawals.map((withdrawal) => (
                    <Card key={withdrawal.id} className='overflow-hidden'>
                      <CardHeader className='bg-gray-50 py-3'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                          <div>
                            <CardTitle className='text-sm'>
                              Saída: {withdrawal.withdrawalNumber}
                            </CardTitle>
                            <p className='text-sm text-gray-500'>
                              Data: {formatDate(withdrawal.withdrawalDate)}
                            </p>
                          </div>
                          <Badge variant='default'>Saída Realizada</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className='p-4'>
                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Valor Total
                            </p>
                            <p className='font-medium'>
                              {formatCurrency(withdrawal.valueWithdrawal)}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Armazém
                            </p>
                            <p className='font-medium'>
                              Armazém {withdrawal.warehouseId}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Processado por
                            </p>
                            <p className='font-medium'>
                              Usuário {withdrawal.processedByUserId}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Autorizado por
                            </p>
                            <p className='font-medium'>
                              Usuário {withdrawal.authorizedByUserId}
                            </p>
                          </div>
                        </div>
                        <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-3'>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Coletado por
                            </p>
                            <p className='font-medium'>
                              {withdrawal.collectedByWorkerId
                                ? `Trabalhador ${withdrawal.collectedByWorkerId}`
                                : withdrawal.collectedByUserId
                                  ? `Usuário ${withdrawal.collectedByUserId}`
                                  : withdrawal.collectedByOther ||
                                    'Não informado'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Ordem de Coleta
                            </p>
                            <p className='font-medium'>
                              #{withdrawal.materialPickingOrderId}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Tipo de Movimento
                            </p>
                            <p className='font-medium'>
                              #{withdrawal.movementTypeId}
                            </p>
                          </div>
                        </div>
                        {withdrawal.notes && (
                          <div className='mt-4 border-t pt-4'>
                            <p className='text-xs font-medium text-gray-500'>
                              Observações
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              {withdrawal.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground py-8 text-center'>
                  Nenhuma saída registrada para esta requisição.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Histórico de Status */}
      {materialRequestData.statusHistory &&
        materialRequestData.statusHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <History className='h-5 w-5' />
                Histórico de Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {materialRequestData.statusHistory.map((history, index) => (
                  <div key={index} className='flex items-start gap-4'>
                    <div className='flex flex-col items-center'>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          index === 0 ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      />
                      {index <
                        materialRequestData.statusHistory!.length - 1 && (
                        <div className='h-8 w-0.5 bg-gray-200' />
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline'>
                            {formatStatus(history.status)}
                          </Badge>
                          {history.changedById && (
                            <span className='text-muted-foreground text-sm'>
                              por Usuário {history.changedById}
                            </span>
                          )}
                        </div>
                        <p className='text-muted-foreground text-sm'>
                          {formatDate(history.changeDate)}
                        </p>
                      </div>
                      {history.notes && (
                        <p className='text-muted-foreground mt-2 text-sm'>
                          {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Contadores */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Ordens de Reserva
                </p>
                <p className='text-2xl font-bold'>
                  {materialRequestData.materialPickingOrders?.length || 0}
                </p>
              </div>
              <ClipboardList className='text-primary h-8 w-8' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Entradas
                </p>
                <p className='text-2xl font-bold'>
                  {materialRequestData.materialReceipts?.length || 0}
                </p>
              </div>
              <Truck className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Saídas
                </p>
                <p className='text-2xl font-bold'>
                  {materialRequestData.materialWithdrawals?.length || 0}
                </p>
              </div>
              <Truck className='h-8 w-8 rotate-180 text-red-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Itens na Requisição
                </p>
                <p className='text-2xl font-bold'>{totalItems}</p>
              </div>
              <Package className='h-8 w-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
