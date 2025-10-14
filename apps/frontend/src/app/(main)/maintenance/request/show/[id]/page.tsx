import { notFound } from 'next/navigation';
import {
  showMaintenanceRequest,
  showMaintenanceRequestBalanceById
} from '@/app/(main)/maintenance/request/maintenance-request-actions';
import { CardMaintenanceSummary } from '@/app/(main)/material/(warehouse)/withdrawal/_components/card-maintenance-summary';
import {
  IMaintenanceRequestBalanceWithRelations,
  IMaintenanceRequestWithRelations
} from '@/app/(main)/maintenance/request/maintenance-request-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Building, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MaterialBalanceSummaryTable } from '@/app/(main)/material/(warehouse)/withdrawal/_components/material-balance-summary-table';
import Image from 'next/image';
import { IMaterialRequestItemWithRelations } from '../../../../material/request/material-request-types';

interface MaintenanceRequestShowPageProps {
  params: {
    id: string;
  };
}

export default async function MaintenanceRequestShowPage({
  params
}: MaintenanceRequestShowPageProps) {
  const id = Number(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const maintenanceRequestDataBalance: IMaintenanceRequestBalanceWithRelations | null =
    await showMaintenanceRequestBalanceById(id);

  const maintenanceRequestDataBase: IMaintenanceRequestWithRelations | null =
    await showMaintenanceRequest(id);

  const maintenanceRequestData = {
    ...maintenanceRequestDataBalance,
    ...maintenanceRequestDataBase
  };

  if (!maintenanceRequestData) {
    notFound();
  }

  const formatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) {
      return '-';
    }
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return String(dateInput);
    }
  };

  // Adaptação do CardMaintenanceSummary para exibir os dados
  // e removendo a dependência de setFieldValue, já que esta é uma página de exibição
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            Requisição de Manutenção: {maintenanceRequestData?.protocolNumber} -{' '}
            {maintenanceRequestData?.building?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 pt-6'>
          {/* Seção de Descrição e Data */}
          <div className='space-y-2'>
            <Label>Descrição da Solicitação</Label>
            <p className='text-muted-foreground text-sm'>
              {maintenanceRequestData.description ||
                'Nenhuma descrição fornecida.'}
            </p>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Data da Solicitação</Label>
              <p className='text-muted-foreground'>
                {maintenanceRequestData.requestedAt
                  ? format(
                      new Date(maintenanceRequestData.requestedAt),
                      'dd/MM/yyyy HH:mm'
                    )
                  : 'Não informada'}
              </p>
            </div>
            <div className='space-y-2'>
              <Label>Solicitante</Label>
              <p className='text-muted-foreground'>
                {/* Combina a unidade com o login do usuário para uma informação completa */}
                {`${maintenanceRequestData?.sipacUnitRequesting?.nomeUnidade || 'Unidade não informada'} (${maintenanceRequestData?.sipacUserLoginRequest || 'usuário desconhecido'})`}
              </p>
            </div>
          </div>

          {/* Seção de Localização */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Complexo</Label>
              <p className='text-muted-foreground'>
                {maintenanceRequestData?.facilityComplex?.name ??
                  'Não informado'}
              </p>
            </div>
            <div className='space-y-2'>
              <Label>Edificação / Local Específico</Label>
              <p className='text-muted-foreground'>
                {/* Prioriza o espaço, depois a edificação, e por último o campo 'local' */}
                {maintenanceRequestData?.space?.name ??
                  maintenanceRequestData?.building?.name ??
                  maintenanceRequestData?.local ??
                  'Não especificado'}
              </p>
            </div>
          </div>

          {/* Seção Visual (Imagem e Mapa) */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Imagem do Local (Referência)</Label>
              <div className='overflow-hidden rounded-lg border'>
                {/* A imagem continua sendo um placeholder, mas o alt text é dinâmico */}
                <Image
                  src='/images/warehouse-building.png'
                  alt={
                    maintenanceRequestData?.building?.name ??
                    'Imagem do local de destino'
                  }
                  width={300}
                  height={200}
                  className='h-32 w-full object-cover'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label>Mapa de Localização</Label>
              {/* O link do mapa agora é dinâmico, baseado na latitude e longitude */}
              <a
                href={
                  maintenanceRequestData?.building?.latitude &&
                  maintenanceRequestData?.building?.longitude
                    ? `https://www.google.com/maps?q=${maintenanceRequestData.building.latitude},${maintenanceRequestData.building.longitude}`
                    : '#'
                }
                target='_blank'
                rel='noopener noreferrer'
                className={`flex h-32 items-center justify-center overflow-hidden rounded-lg border ${
                  maintenanceRequestData?.building?.latitude
                    ? 'hover:border-primary'
                    : 'cursor-not-allowed'
                }`}
              >
                <div className='text-center'>
                  <MapPin className='text-accent mx-auto mb-2 h-8 w-8' />
                  <p className='text-accent text-sm'>
                    {maintenanceRequestData?.building?.latitude
                      ? 'Ver Mapa Interativo'
                      : 'Localização Indisponível'}
                  </p>
                  <p className='text-accent/80 text-xs'>
                    {maintenanceRequestData?.building?.latitude
                      ? 'Clique para abrir no mapa'
                      : 'Coordenadas não fornecidas'}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Seção de Badges de Resumo */}
          <div className='flex flex-wrap gap-2'>
            {maintenanceRequestData?.facilityComplex?.name && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <Building className='h-3 w-3' />
                {maintenanceRequestData.facilityComplex.name}
              </Badge>
            )}
            {maintenanceRequestData?.building?.name && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {maintenanceRequestData.building.name}
              </Badge>
            )}
            {maintenanceRequestData?.sipacUnitRequesting?.sigla && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <User className='h-3 w-3' />
                {`Solicitante: ${maintenanceRequestData.sipacUnitRequesting.sigla}`}
              </Badge>
            )}
          </div>

          <h3 className='text-md font-semibold'>
            Resumo das Movimentações de Materiais Relativas à Requisição de
            Manutenção
          </h3>
          {/* MaterialBalanceSummaryTable precisa ser importado corretamente ou recriado aqui */}
          {/* Por enquanto, vou deixar um placeholder ou adaptar o componente */}
          {maintenanceRequestData.itemsBalance && (
            <MaterialBalanceSummaryTable
              itemsBalance={maintenanceRequestData.itemsBalance}
            />
          )}
        </CardContent>
      </Card>

      {maintenanceRequestData.materialRequests &&
        maintenanceRequestData.materialRequests?.length > 0 && (
          // Card Principal que agrupa todas as Requisições de Materiais
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>
                Requisições de Materiais Associadas {/* Título da seção */}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Aqui começa o loop para cada requisição individual */}
              {maintenanceRequestData.materialRequests.map(
                (
                  req: IMaintenanceRequestWithRelations['materialRequests'][number],
                  index: number
                ) => (
                  <Card key={index} className='overflow-hidden'>
                    <CardHeader className='bg-gray-50'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div>
                          <CardTitle className='text-lg'>
                            Requisição: {req.protocolNumber}
                          </CardTitle>
                          <p className='text-sm text-gray-500'>
                            ID: {req.id} &bull; Data:{' '}
                            {formatDate(req.requestDate)}
                          </p>
                        </div>
                        <div className='text-sm font-medium'>
                          Status: {req.currentStatus}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='p-4'>
                      {/* Tabela de Itens */}
                      {req.items && req.items.length > 0 && (
                        <div className='overflow-x-auto rounded-lg border'>
                          <table className='w-full text-sm'>
                            <thead className='bg-gray-100'>
                              <tr>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Material
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Qtd. Requisitada
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Qtd. Aprovada
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Valor Unitário
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-gray-700'>
                                  Total do Item
                                </th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200 bg-white'>
                              {req.items.map(
                                (
                                  item: IMaterialRequestItemWithRelations,
                                  itemIndex: number
                                ) => {
                                  const itemTotalPrice =
                                    Number(item.quantityRequested || 0) *
                                    Number(item.unitPrice || 0);
                                  return (
                                    <tr
                                      key={itemIndex}
                                      className='hover:bg-gray-50'
                                    >
                                      <td className='px-4 py-2 text-gray-900'>
                                        {item.requestedGlobalMaterial?.name}
                                      </td>
                                      <td className='px-4 py-2 text-gray-900'>
                                        {Number(
                                          item.quantityRequested
                                        ).toLocaleString()}
                                      </td>
                                      <td className='px-4 py-2 text-gray-900'>
                                        {Number(
                                          item.quantityApproved
                                        ).toLocaleString()}
                                      </td>
                                      <td className='px-4 py-2 text-gray-900'>
                                        {Number(item.unitPrice).toLocaleString(
                                          'pt-BR',
                                          {
                                            style: 'currency',
                                            currency: 'BRL'
                                          }
                                        )}
                                      </td>
                                      <td className='px-4 py-2 text-gray-900'>
                                        {itemTotalPrice.toLocaleString(
                                          'pt-BR',
                                          {
                                            style: 'currency',
                                            currency: 'BRL'
                                          }
                                        )}
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {/* Rodapé com os totais */}
                      <div className='mt-4 grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-4 sm:grid-cols-4'>
                        <div className='text-center'>
                          <p className='text-xs font-medium text-gray-500'>
                            Total de Itens
                          </p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {req.items?.length
                              ? req.items?.length
                              : 'Nenhum item'}
                          </p>
                        </div>
                        <div className='text-center'>
                          <p className='text-xs font-medium text-gray-500'>
                            Valor Total da Requisição
                          </p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {req.items
                              ?.reduce(
                                (sum, item) =>
                                  sum +
                                  Number(item.quantityRequested || 0) *
                                    Number(item.unitPrice || 0),
                                0
                              )
                              .toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
