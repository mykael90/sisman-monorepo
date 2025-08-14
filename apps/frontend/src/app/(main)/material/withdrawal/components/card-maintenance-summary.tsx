'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../../../../components/ui/card';
import { Label } from '../../../../../components/ui/label';
import { Building, MapPin, User } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { format } from 'date-fns';
import { IMaintenanceRequestData } from './request-maintenance-material-form';

export function CardMaintenanceSummary({
  maintenanceRequestData
}: {
  maintenanceRequestData: IMaintenanceRequestData;
}) {
  return (
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
              {maintenanceRequestData?.facilityComplex?.name ?? 'Não informado'}
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
          Resumo da Movimentação de Materiais
        </h3>
        {/* A tabela de materiais permanece, aguardando os dados corretos */}
        {/* <MaterialTable
        materials={maintenanceRequestMaterialsSummary}
        onRemove={() => {}} 
        onUpdateQuantity={() => {}}
        readOnly={true}
      /> */}
      </CardContent>
    </Card>
  );
}
