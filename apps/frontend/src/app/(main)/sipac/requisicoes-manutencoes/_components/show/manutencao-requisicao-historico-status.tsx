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
import { Clock, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface ManutencaoRequisicaoHistoricoStatusProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoHistoricoStatus({
  data
}: ManutencaoRequisicaoHistoricoStatusProps) {
  if (!data.historico || data.historico.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Histórico de Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Timeline>
          {data.historico.map((item, index) => (
            <TimelineItem key={item.id}>
              <TimelineConnector />
              <TimelineHeader>
                <TimelineIcon>
                  <UserCircle className='h-4 w-4' />
                </TimelineIcon>
                <TimelineTitle className='flex items-center gap-2'>
                  {item.status}
                  <Badge variant='outline'>{item.usuario}</Badge>
                  {item.data && (
                    <TimelineDate>
                      <Clock className='h-3 w-3' />
                      {format(new Date(item.data), 'dd MMM yyyy HH:mm', {
                        locale: ptBR
                      })}
                    </TimelineDate>
                  )}
                </TimelineTitle>
              </TimelineHeader>
              <TimelineBody>
                {item.observacoes && item.observacoes !== '-' && (
                  <TimelineDescription>
                    Observações: {item.observacoes}
                  </TimelineDescription>
                )}
                {item.ramal && item.ramal !== '-' && (
                  <TimelineDescription>Ramal: {item.ramal}</TimelineDescription>
                )}
              </TimelineBody>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
