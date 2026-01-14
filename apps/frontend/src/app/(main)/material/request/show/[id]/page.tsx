import { notFound } from 'next/navigation';
import {
  showMaterialRequestBalanceByProtocol,
  showRequest
} from '@/app/(main)/material/request/material-request-actions';
import {
  IMaterialRequestBalanceWithRelations,
  IMaterialRequestShowWithRelations
} from '@/app/(main)/material/request/material-request-types';
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

  const materialRequestDataBalance: IMaterialRequestBalanceWithRelations | null =
    await showMaterialRequestBalanceByProtocol(
      materialRequestData?.protocolNumber as string
    );

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
  const formatOnlyDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) {
      return '-';
    }
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
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

  // Ordenar histórico de status por data (mais recente primeiro)
  const sortedStatusHistory = materialRequestData.statusHistory
    ? [...materialRequestData.statusHistory].sort(
        (a, b) =>
          new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime()
      )
    : [];

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
                {formatOnlyDate(materialRequestData.requestDate)}
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
                Almoxarifado
              </Label>
              <p className='text-muted-foreground'>
                {materialRequestData.storage?.name || 'Não informado'}
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

      {/* Card de Balanço da Requisição */}
      {materialRequestDataBalance?.itemsBalance &&
        materialRequestDataBalance.itemsBalance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                Balanço da Requisição de Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto rounded-lg border'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-100'>
                    <tr>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Material
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Unidade
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Qtd Solicitada
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Qtd Aprovada
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Qtd Recebida
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Qtd Retirada
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Qtd Reservada
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Qtd Restrita
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Saldo Livre Efetivo
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Saldo Livre Potencial
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Saldo Potencial
                      </th>
                      <th className='px-4 py-3 text-left font-medium text-gray-700'>
                        Valor Unitário
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {materialRequestDataBalance.itemsBalance.map((item) => (
                      <tr
                        key={item.globalMaterialId}
                        className='hover:bg-gray-50'
                      >
                        <td className='px-4 py-3'>
                          <div>
                            <p className='font-medium'>{item.name}</p>
                            {item.description && (
                              <p className='text-muted-foreground mt-1 line-clamp-1 text-xs'>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className='px-4 py-3'>{item.unitOfMeasure}</td>
                        <td className='px-4 py-3'>
                          {Number(item.quantityRequested).toLocaleString()}
                        </td>
                        <td className='px-4 py-3'>
                          {Number(item.quantityApproved).toLocaleString()}
                        </td>
                        <td className='px-4 py-3'>
                          {Number(item.quantityReceivedSum).toLocaleString()}
                        </td>
                        <td className='px-4 py-3'>
                          {Number(item.quantityWithdrawnSum).toLocaleString()}
                        </td>
                        <td className='px-4 py-3'>
                          {Number(item.quantityReserved).toLocaleString()}
                        </td>
                        <td className='px-4 py-3'>
                          {Number(item.quantityRestricted).toLocaleString()}
                        </td>
                        <td className='px-4 py-3 font-medium'>
                          <span
                            className={
                              Number(item.quantityFreeBalanceEffective) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {Number(
                              item.quantityFreeBalanceEffective
                            ).toLocaleString()}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={
                              Number(item.quantityFreeBalancePotential) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {Number(
                              item.quantityFreeBalancePotential
                            ).toLocaleString()}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={
                              Number(item.quantityBalancePotential) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {Number(
                              item.quantityBalancePotential
                            ).toLocaleString()}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          {formatCurrency(item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className='bg-gray-50'>
                    <tr>
                      <td
                        colSpan={2}
                        className='px-4 py-3 text-right font-medium'
                      >
                        Totais:
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) => sum + Number(item.quantityRequested),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) => sum + Number(item.quantityApproved),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.quantityReceivedSum),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.quantityWithdrawnSum),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) => sum + Number(item.quantityReserved),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.quantityRestricted),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.quantityFreeBalanceEffective),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.quantityFreeBalancePotential),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {materialRequestDataBalance.itemsBalance
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.quantityBalancePotential),
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {formatCurrency(
                          materialRequestDataBalance.itemsBalance.reduce(
                            (sum, item) =>
                              sum +
                              Number(item.quantityRequested) *
                                Number(item.unitPrice),
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className='mt-4 text-sm text-gray-600'>
                <p>
                  <strong>Legenda:</strong>
                </p>
                <ul className='mt-1 list-inside list-disc space-y-1'>
                  <li>
                    <strong>Saldo Livre Efetivo:</strong> Quantidade realmente
                    disponível para uso
                  </li>
                  <li>
                    <strong>Saldo Livre Potencial:</strong> Quantidade que
                    poderá ficar disponível após liberações
                  </li>
                  <li>
                    <strong>Saldo Potencial:</strong> Quantidade total potencial
                    considerando todas as transações
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Abas para diferentes seções */}
      <Tabs defaultValue='materials' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='materials' className='flex items-center gap-2'>
            <Package className='h-4 w-4' />
            Itens da Requisição ({totalItems})
          </TabsTrigger>
          <TabsTrigger value='receipts' className='flex items-center gap-2'>
            <Truck className='h-4 w-4' />
            Entradas Associadas (
            {materialRequestData.materialReceipts?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value='pickingOrders'
            className='flex items-center gap-2'
          >
            <ClipboardList className='h-4 w-4' />
            Reservas Associadas (
            {materialRequestData.materialPickingOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value='withdrawals' className='flex items-center gap-2'>
            <Truck className='h-4 w-4 rotate-180' />
            Saídas Associadas (
            {materialRequestData.materialWithdrawals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value='restrictions' className='flex items-center gap-2'>
            <Warehouse className='h-4 w-4' />
            Restrição ({materialRequestData.restrictionOrders ? '1' : '0'})
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
                          Qtd Solicitada
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Qtd Aprovada
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Qtd Entregue
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-gray-700'>
                          Qtd Retornada
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
                              {Number(item.quantityDelivered).toLocaleString()}
                            </td>
                            <td className='px-4 py-3'>
                              {Number(item.quantityReturned).toLocaleString()}
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
                          colSpan={8}
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
                              Recebimento: {receipt.receiptNumber}
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
                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
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
                              Depósito Destino
                            </p>
                            <p className='font-medium'>
                              {receipt.destinationWarehouse?.name ||
                                `Depósito ${receipt.destinationWarehouseId}`}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Tipo de Movimento
                            </p>
                            <p className='font-medium'>
                              {receipt.movementType?.name ||
                                `Tipo ${receipt.movementTypeId}`}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Processado por
                            </p>
                            <p className='font-medium'>
                              {receipt.processedByUser?.name ||
                                receipt.processedByUser?.login ||
                                `Usuário ${receipt.processedByUserId}`}
                            </p>
                          </div>
                        </div>

                        {/* Itens da Entrada */}
                        {receipt.items && receipt.items.length > 0 && (
                          <div className='mt-4 border-t pt-4'>
                            <p className='mb-2 text-sm font-medium'>
                              Itens Recebidos ({receipt.items.length})
                            </p>
                            <div className='overflow-x-auto rounded-lg border'>
                              <table className='w-full text-xs'>
                                <thead className='bg-gray-100'>
                                  <tr>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Código
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Material
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Qtd Esperada
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Qtd Recebida
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Qtd Rejeitada
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Valor Unitário
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                  {receipt.items.map((item) => {
                                    const itemTotal =
                                      Number(item.quantityReceived) *
                                      Number(item.unitPrice);
                                    return (
                                      <tr
                                        key={item.id}
                                        className='hover:bg-gray-50'
                                      >
                                        <td className='px-3 py-2'>
                                          {item.materialId ||
                                            'Código não identificado'}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {item.material?.name ||
                                            'Material não identificado'}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {Number(
                                            item.quantityExpected
                                          ).toLocaleString()}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {Number(
                                            item.quantityReceived
                                          ).toLocaleString()}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {Number(
                                            item.quantityRejected
                                          ).toLocaleString()}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {formatCurrency(item.unitPrice)}
                                        </td>
                                        <td className='px-3 py-2 font-medium'>
                                          {formatCurrency(itemTotal)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

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

        {/* Aba de Ordens de Reserva */}
        <TabsContent value='pickingOrders' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              {materialRequestData.materialPickingOrders &&
              materialRequestData.materialPickingOrders.length > 0 ? (
                <div className='space-y-4'>
                  {materialRequestData.materialPickingOrders.map(
                    (pickingOrder) => (
                      <Card key={pickingOrder.id} className='overflow-hidden'>
                        <CardHeader className='bg-gray-50 py-3'>
                          <div className='flex flex-wrap items-center justify-between gap-2'>
                            <div>
                              <CardTitle className='text-sm'>
                                Ordem de Coleta:{' '}
                                {pickingOrder.pickingOrderNumber}
                              </CardTitle>
                              <p className='text-sm text-gray-500'>
                                Solicitada em:{' '}
                                {formatDate(pickingOrder.requestedAt)}
                              </p>
                            </div>
                            <Badge
                              variant={
                                pickingOrder.status === 'FULLY_WITHDRAWN'
                                  ? 'default'
                                  : pickingOrder.status ===
                                      'PENDING_PREPARATION'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {pickingOrder.status === 'FULLY_WITHDRAWN'
                                ? 'Totalmente Retirada'
                                : pickingOrder.status === 'PENDING_PREPARATION'
                                  ? 'Pendente'
                                  : pickingOrder.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className='p-4'>
                          <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                            <div>
                              <p className='text-xs font-medium text-gray-500'>
                                Depósito Transitório
                              </p>
                              <p className='font-medium'>
                                {pickingOrder.warehouse?.name ||
                                  `Depósito ${pickingOrder.warehouseId}`}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-500'>
                                Solicitado por
                              </p>
                              <p className='font-medium'>
                                {pickingOrder.requestedByUser?.name ||
                                  pickingOrder.requestedByUser?.login ||
                                  `Usuário ${pickingOrder.requestedByUserId}`}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-500'>
                                Valor Total
                              </p>
                              <p className='font-medium'>
                                {formatCurrency(pickingOrder.valuePickingOrder)}
                              </p>
                            </div>
                          </div>

                          {/* Itens da Ordem de Coleta */}
                          {pickingOrder.items &&
                            pickingOrder.items.length > 0 && (
                              <div className='mt-4 border-t pt-4'>
                                <p className='mb-2 text-sm font-medium'>
                                  Itens da Ordem de Reserva (
                                  {pickingOrder.items.length})
                                </p>
                                <div className='overflow-x-auto rounded-lg border'>
                                  <table className='w-full text-xs'>
                                    <thead className='bg-gray-100'>
                                      <tr>
                                        <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                          Código
                                        </th>
                                        <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                          Material
                                        </th>
                                        <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                          Qtd Solicitada
                                        </th>
                                        <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                          Qtd Separada
                                        </th>
                                        <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                          Qtd Retirada
                                        </th>
                                        <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                          Valor Unitário
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-200'>
                                      {pickingOrder.items.map((item) => (
                                        <tr
                                          key={item.id}
                                          className='hover:bg-gray-50'
                                        >
                                          <td className='px-3 py-2'>
                                            {item.globalMaterialId ||
                                              'Código não identificado'}
                                          </td>
                                          <td className='px-3 py-2'>
                                            {item.globalMaterial?.name ||
                                              'Material não identificado'}
                                          </td>
                                          <td className='px-3 py-2'>
                                            {Number(
                                              item.quantityToPick
                                            ).toLocaleString()}
                                          </td>
                                          <td className='px-3 py-2'>
                                            {Number(
                                              item.quantityPicked
                                            ).toLocaleString()}
                                          </td>
                                          <td className='px-3 py-2'>
                                            {Number(
                                              item.quantityWithdrawn
                                            ).toLocaleString()}
                                          </td>
                                          <td className='px-3 py-2'>
                                            {formatCurrency(item.unitPrice)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                          {pickingOrder.notes && (
                            <div className='mt-4 border-t pt-4'>
                              <p className='text-xs font-medium text-gray-500'>
                                Observações
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                {pickingOrder.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                <p className='text-muted-foreground py-8 text-center'>
                  Nenhuma ordem de reserva registrada para esta requisição.
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
                        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
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
                              Depósito Retirada
                            </p>
                            <p className='font-medium'>
                              {withdrawal.warehouse?.name ||
                                `Depósito ${withdrawal.warehouseId}`}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Tipo de Movimento
                            </p>
                            <p className='font-medium'>
                              {withdrawal.movementType?.name ||
                                `Tipo ${withdrawal.movementTypeId}`}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Processado por
                            </p>
                            <p className='font-medium'>
                              {withdrawal.processedByUser?.name ||
                                withdrawal.processedByUser?.login ||
                                `Usuário ${withdrawal.processedByUserId}`}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Autorizado por
                            </p>
                            <p className='font-medium'>
                              {withdrawal.authorizedByUser?.name ||
                                withdrawal.authorizedByUser?.login ||
                                `Usuário ${withdrawal.authorizedByUserId}`}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-500'>
                              Coletado por
                            </p>
                            <p className='font-medium'>
                              {withdrawal.collectedByWorker
                                ? withdrawal.collectedByWorker.name
                                : withdrawal.collectedByUser
                                  ? withdrawal.collectedByUser.name ||
                                    withdrawal.collectedByUser.login
                                  : withdrawal.collectedByOther ||
                                    'Não informado'}
                            </p>
                          </div>
                        </div>

                        {/* Itens da Saída */}
                        {withdrawal.items && withdrawal.items.length > 0 && (
                          <div className='mt-4 border-t pt-4'>
                            <p className='mb-2 text-sm font-medium'>
                              Itens Retirados ({withdrawal.items.length})
                            </p>
                            <div className='overflow-x-auto rounded-lg border'>
                              <table className='w-full text-xs'>
                                <thead className='bg-gray-100'>
                                  <tr>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Código
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Material
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Quantidade
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Valor Unitário
                                    </th>
                                    <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                      Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                  {withdrawal.items.map((item) => {
                                    const itemTotal =
                                      Number(item.quantityWithdrawn) *
                                      Number(item.unitPrice);
                                    return (
                                      <tr
                                        key={item.id}
                                        className='hover:bg-gray-50'
                                      >
                                        <td className='px-3 py-2'>
                                          {item.globalMaterialId ||
                                            'Código não identificado'}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {item.globalMaterial?.name ||
                                            'Material não identificado'}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {Number(
                                            item.quantityWithdrawn
                                          ).toLocaleString()}
                                        </td>
                                        <td className='px-3 py-2'>
                                          {formatCurrency(item.unitPrice)}
                                        </td>
                                        <td className='px-3 py-2 font-medium'>
                                          {formatCurrency(itemTotal)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

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
        {/* Aba de Restrições */}
        <TabsContent value='restrictions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Restrição de Materiais</CardTitle>
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
                          Depósito
                        </p>
                        <p className='font-medium'>
                          {materialRequestData.restrictionOrders.warehouse
                            ?.name ||
                            `Depósito ${materialRequestData.restrictionOrders.warehouseId}`}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-500'>
                          Processado por
                        </p>
                        <p className='font-medium'>
                          {materialRequestData.restrictionOrders.processedByUser
                            ?.name ||
                            materialRequestData.restrictionOrders
                              .processedByUser?.login ||
                            `Usuário ${materialRequestData.restrictionOrders.processedByUserId}`}
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

                    {/* Itens da Restrição */}
                    {materialRequestData.restrictionOrders.items &&
                      materialRequestData.restrictionOrders.items.length >
                        0 && (
                        <div className='mt-4 border-t pt-4'>
                          <p className='mb-2 text-sm font-medium'>
                            Itens Restritos (
                            {materialRequestData.restrictionOrders.items.length}
                            )
                          </p>
                          <div className='overflow-x-auto rounded-lg border'>
                            <table className='w-full text-xs'>
                              <thead className='bg-gray-100'>
                                <tr>
                                  <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                    Código Material
                                  </th>
                                  <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                    Nome
                                  </th>
                                  <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                    Unidade
                                  </th>
                                  <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                    Quantidade Restrita
                                  </th>
                                  <th className='px-3 py-2 text-left font-medium text-gray-700'>
                                    Item da Requisição
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='divide-y divide-gray-200'>
                                {materialRequestData.restrictionOrders.items.map(
                                  (item) => (
                                    <tr
                                      key={item.id}
                                      className='hover:bg-gray-50'
                                    >
                                      <td className='px-3 py-2'>
                                        {item.globalMaterialId ||
                                          'Não especificado'}
                                      </td>
                                      <td className='px-3 py-2'>
                                        {item.globalMaterial?.name ||
                                          'Não especificado'}
                                      </td>
                                      <td className='px-3 py-2'>
                                        {item.globalMaterial?.unitOfMeasure ||
                                          'Não especificado'}
                                      </td>
                                      <td className='px-3 py-2'>
                                        {Number(
                                          item.quantityRestricted || 0
                                        ).toLocaleString()}
                                      </td>
                                      <td className='px-3 py-2'>
                                        ID: {item.targetMaterialRequestItemId}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

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
                  Nenhuma restrição registrada para esta requisição.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Histórico de Status */}
      {sortedStatusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <History className='h-5 w-5' />
              Histórico de Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {sortedStatusHistory.map((history, index) => (
                <div key={index} className='flex items-start gap-4'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        index === 0 ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                    {index < sortedStatusHistory.length - 1 && (
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
