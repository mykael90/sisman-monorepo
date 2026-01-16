import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Building, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { Badge } from '../../../../../../components/ui/badge';

interface ManutencaoRequisicaoGeralInfoProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoGeralInfo({
  data
}: ManutencaoRequisicaoGeralInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>
          Requisição de Manutenção: {data?.numeroRequisicao}
        </CardTitle>
        {/* Seção de Badges de Resumo */}
        <div className='flex flex-wrap gap-2'>
          {data?.predios.length > 0 && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Building className='h-3 w-3' />
              {data.predios[0].denominacaoPredio}
            </Badge>
          )}
          {data?.nomeUnidadeRequisitante && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <User className='h-3 w-3' />
              {`Solicitante: ${data.nomeUnidadeRequisitante}`}
            </Badge>
          )}
        </div>
        {/* <div className='inline-flex flex-row gap-2'>
          <Label>RMan:</Label>{' '}
          <p className='text-muted-foreground text-sm'>
            {data?.protocolNumber}
          </p>
        </div> */}
        {/* <div className='inline-flex flex-row gap-2'>
          <Label>Unidade:</Label>{' '}
          <p className='text-muted-foreground text-sm'>
            {data?.sipacUnitRequesting?.nomeUnidade || 'Unidade não informada'}
          </p>
        </div> */}
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Seção de Descrição e Data */}
        <div className='inline-flex flex-row gap-2'>
          <Label>Descrição:</Label>
          <p className='text-muted-foreground text-sm'>
            {data.descricao || 'Nenhuma descrição fornecida.'}
          </p>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Data de Solicitação:</Label>
            <span className='text-muted-foreground'>
              {data.dataDeCadastro
                ? format(new Date(data.dataDeCadastro), 'dd/MM/yyyy HH:mm')
                : 'Não informada'}
            </span>
          </div>
          <div className='space-y-2'>
            <Label>Solicitante</Label>
            <p className='text-muted-foreground'>
              {`${data?.unidadeRequisitante || 'Unidade não informada'} (${data?.usuarioGravacao || 'usuário desconhecido'})`}
            </p>
          </div>
        </div>

        {/* Seção de Localização */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Edificação</Label>
            <p className='text-muted-foreground'>
              {/* Prioriza o espaço, depois a edificação, e por último o campo 'local' */}
              {data?.predios[0]?.denominacaoPredio || 'Não especificado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Local Específico</Label>
            <p className='text-muted-foreground'>
              {/* Prioriza o espaço, depois a edificação, e por último o campo 'local' */}
              {data?.local || 'Não especificado'}
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
                alt={data?.nomePredio ?? 'Imagem do local de destino'}
                width={300}
                height={200}
                className='h-32 w-full object-cover'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Mapa de Localização</Label>
            {/* O link do mapa agora é dinâmico, baseado na latitude e longitude */}
            {/* <a
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
            </a> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
