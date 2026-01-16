import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  TimelineDate,
  TimelineDescription,
  TimelineTitle
} from '@/components/ui/timeline';
import { Clock, Wrench, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ManutencaoRequisicaoFluxoServicoProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoFluxoServico({
  data
}: ManutencaoRequisicaoFluxoServicoProps) {
  if (!data.informacoesServico || data.informacoesServico.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Fluxo de Serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <Timeline>
          {data.informacoesServico.map((servico, index) => (
            <TimelineItem key={servico.id}>
              <TimelineConnector />
              <TimelineHeader>
                <TimelineIcon>
                  <Wrench className='h-4 w-4' />
                </TimelineIcon>
                <TimelineTitle className='flex items-center gap-2'>
                  Serviço -{' '}
                  {servico.diagnostico !== '-'
                    ? servico.diagnostico
                    : 'Diagnóstico não informado'}
                  {servico.dataDeCadastro && (
                    <TimelineDate>
                      <Clock className='h-3 w-3' />
                      {format(
                        new Date(servico.dataDeCadastro),
                        'dd MMM yyyy HH:mm',
                        { locale: ptBR }
                      )}
                    </TimelineDate>
                  )}
                </TimelineTitle>
              </TimelineHeader>
              <TimelineBody>
                {servico.executante && (
                  <TimelineDescription className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    Executante: {servico.executante}
                  </TimelineDescription>
                )}
                {servico.tecnicoResponsavel && (
                  <TimelineDescription className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    Técnico Responsável: {servico.tecnicoResponsavel}
                  </TimelineDescription>
                )}
              </TimelineBody>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
