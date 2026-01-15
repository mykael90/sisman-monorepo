import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { IMaintenanceRequestShowWithRelations } from '@/app/(main)/maintenance/request/maintenance-request-types';
import Image from 'next/image';
import { Building, MapPin, User } from 'lucide-react';
import { Badge } from '../../../../../../../components/ui/badge';
import { format } from 'date-fns';

interface MaintenanceRequestGeneralInfoProps {
  data: IMaintenanceRequestShowWithRelations;
}

export function MaintenanceRequestGeneralInfo({
  data
}: MaintenanceRequestGeneralInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Informações Gerais</CardTitle>
        Requisição de Manutenção: {data?.protocolNumber} -{' '}
        {data?.building?.name}
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        {/* Seção de Descrição e Data */}
        <div className='space-y-2'>
          <p className='text-muted-foreground text-sm'>
            {data.description || 'Nenhuma descrição fornecida.'}
          </p>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <p className='text-muted-foreground'>
              Data da Solicitação:{' '}
              {data.requestedAt
                ? format(new Date(data.requestedAt), 'dd/MM/yyyy HH:mm')
                : 'Não informada'}
            </p>
          </div>
          <div className='space-y-2'>
            <p className='text-muted-foreground'>
              Solicitante:{' '}
              {`${data?.sipacUnitRequesting?.nomeUnidade || 'Unidade não informada'} (${data?.sipacUserLoginRequest || 'usuário desconhecido'})`}
            </p>
          </div>
        </div>

        {/* Seção de Badges de Resumo */}
        <div className='flex flex-wrap gap-2'>
          {data?.facilityComplex?.name && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Building className='h-3 w-3' />
              {data.facilityComplex.name}
            </Badge>
          )}
          {data?.building?.name && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <MapPin className='h-3 w-3' />
              {data.building.name}
            </Badge>
          )}
          {data?.sipacUnitRequesting?.sigla && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <User className='h-3 w-3' />
              {`Solicitante: ${data.sipacUnitRequesting.sigla}`}
            </Badge>
          )}
        </div>
        {/* Seção de Localização */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Complexo</Label>
            <p className='text-muted-foreground'>
              {data?.facilityComplex?.name ?? 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Edificação / Local Específico</Label>
            <p className='text-muted-foreground'>
              {/* Prioriza o espaço, depois a edificação, e por último o campo 'local' */}
              {data?.space?.name ??
                data?.building?.name ??
                data?.local ??
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
                alt={data?.building?.name ?? 'Imagem do local de destino'}
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
                data?.building?.latitude && data?.building?.longitude
                  ? `https://www.google.com/maps?q=${data.building.latitude},${data.building.longitude}`
                  : '#'
              }
              target='_blank'
              rel='noopener noreferrer'
              className={`flex h-32 items-center justify-center overflow-hidden rounded-lg border ${
                data?.building?.latitude
                  ? 'hover:border-primary'
                  : 'cursor-not-allowed'
              }`}
            >
              <div className='text-center'>
                <MapPin className='text-accent mx-auto mb-2 h-8 w-8' />
                <p className='text-accent text-sm'>
                  {data?.building?.latitude
                    ? 'Ver Mapa Interativo'
                    : 'Localização Indisponível'}
                </p>
                <p className='text-accent/80 text-xs'>
                  {data?.building?.latitude
                    ? 'Clique para abrir no mapa'
                    : 'Coordenadas não fornecidas'}
                </p>
              </div>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
