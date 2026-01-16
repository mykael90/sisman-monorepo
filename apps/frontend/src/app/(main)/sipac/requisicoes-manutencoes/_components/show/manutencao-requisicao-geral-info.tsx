import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import {
  Building,
  MapPin,
  User,
  Tag,
  CalendarDays,
  Divide
} from 'lucide-react';
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
        <CardTitle className='flex flex-col gap-2 text-lg md:flex-row md:items-center md:gap-4'>
          <span>Requisição de Manutenção: {data?.numeroRequisicao}</span>
          {data?.status && <Badge variant='default'>{data.status}</Badge>}
        </CardTitle>
        {/* Seção de Badges de Resumo */}
        <div className='mt-2 flex flex-wrap gap-2'>
          {data?.predios && data.predios.length > 0 && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Building className='h-3 w-3' />
              {data.predios[0].denominacaoPredio}
            </Badge>
          )}
          {data?.unidadeRequisitante && ( // Ajustado para usar o objeto unidadeRequisitante
            <Badge variant='secondary' className='flex items-center gap-1'>
              <User className='h-3 w-3' />
              {`Solicitante: ${data.unidadeRequisitante.nomeUnidade}`}
            </Badge>
          )}
          {data?.tipoDaRequisicao && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Tag className='h-3 w-3' />
              {data.tipoDaRequisicao}
            </Badge>
          )}
          {data?.divisao && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Divide className='h-3 w-3' />
              {data.divisao}
            </Badge>
          )}
          {data?.dataDeCadastro && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <CalendarDays className='h-3 w-3' />
              {`Cadastrada em: ${format(new Date(data.dataDeCadastro), 'dd/MM/yyyy HH:mm')}`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Seção de Descrição e Data */}
        <div className='space-y-2'>
          <Label>Descrição:</Label>
          <p className='text-muted-foreground text-sm'>
            {data.descricao || 'Nenhuma descrição fornecida.'}
          </p>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Usuário de Gravação:</Label>
            <p className='text-muted-foreground'>
              {data.usuarioGravacao || 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Unidade de Custo:</Label>
            <p className='text-muted-foreground'>
              {data?.unidadeCusto?.nomeUnidade || 'Não informada'}
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
            <a
              href={
                data?.predios[0]?.latitude && data?.predios[0]?.longitude
                  ? `https://www.google.com/maps?q=${data.predios[0].latitude},${data.predios[0].longitude}`
                  : '#'
              }
              target='_blank'
              rel='noopener noreferrer'
              className={`flex h-32 items-center justify-center overflow-hidden rounded-lg border ${
                data?.predios[0]?.latitude
                  ? 'hover:border-primary'
                  : 'cursor-not-allowed'
              }`}
            >
              <div className='text-center'>
                <MapPin className='text-accent mx-auto mb-2 h-8 w-8' />
                <p className='text-accent text-sm'>
                  {data?.predios[0]?.latitude
                    ? 'Ver Mapa Interativo'
                    : 'Localização Indisponível'}
                </p>
                <p className='text-accent/80 text-xs'>
                  {data?.predios[0]?.latitude
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
