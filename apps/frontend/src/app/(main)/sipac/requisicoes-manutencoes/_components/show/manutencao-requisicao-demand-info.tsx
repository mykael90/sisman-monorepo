import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';

interface ManutencaoRequisicaoDemandInfoProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoDemandInfo({
  data
}: ManutencaoRequisicaoDemandInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Informações da Demanda</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <p className='font-semibold'>Unidade Requisitante:</p>
          <p>{data.nomeUnidadeRequisitante || 'N/A'}</p>
        </div>
        <div>
          <p className='font-semibold'>Representante da Unidade:</p>
          <p>{data.representanteDaUnidadeDeOrigem || 'N/A'}</p>
        </div>
        <div>
          <p className='font-semibold'>Telefones do Representante:</p>
          <p>{data.telefonesDoRepresentante || 'N/A'}</p>
        </div>
        <div>
          <p className='font-semibold'>Ramal:</p>
          <p>{data.ramal || 'N/A'}</p>
        </div>
        <div>
          <p className='font-semibold'>Email:</p>
          <p>{data.email || 'N/A'}</p>
        </div>
        <div>
          <p className='font-semibold'>Horário para Atendimento:</p>
          <p>{data.horarioParaAtendimento || 'N/A'}</p>
        </div>
        <div className='md:col-span-2'>
          <p className='font-semibold'>Observação Geral:</p>
          <p>{data.observacao || 'Nenhuma observação'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
