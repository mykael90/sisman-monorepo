import { notFound } from 'next/navigation';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { showSipacRequisicaoManutencao } from '../../requisicoes-manutencoes-actions';
import { ManutencaoRequisicaoHeader } from '../../_components/show/manutencao-requisicao-header';
import { ManutencaoRequisicaoGeralInfo } from '../../_components/show/manutencao-requisicao-geral-info';
import { ManutencaoRequisicaoDemandInfo } from '../../_components/show/manutencao-requisicao-demand-info';
import { ManutencaoRequisicaoHistoricoStatus } from '../../_components/show/manutencao-requisicao-historico-status';
import { ManutencaoRequisicaoFluxoServico } from '../../_components/show/manutencao-requisicao-fluxo-servico';
import { ManutencaoRequisicaoListaMateriais } from '../../_components/show/manutencao-requisicao-lista-materiais';
import { ManutencaoRequisicaoEstatisticas } from '../../_components/show/manutencao-requisicao-estatisticas';
import { ManutencaoRequisicaoAnexos } from '../../_components/show/manutencao-requisicao-anexos';

interface RequisicaoManutencaoShowPageProps {
  params: Promise<{
    id: number;
  }>;
}

export default async function RequisicaoManutencaoShowPage({
  params
}: RequisicaoManutencaoShowPageProps) {
  const { id } = await params;

  if (isNaN(id)) notFound();

  const requisicaoManutencaoData: ISipacRequisicaoManutencaoShow | null =
    await showSipacRequisicaoManutencao(id);

  if (!requisicaoManutencaoData) {
    // Check if base data is null first
    notFound();
  }

  return (
    <div className='container mx-auto space-y-6 pb-6'>
      <ManutencaoRequisicaoHeader />
      <ManutencaoRequisicaoGeralInfo data={requisicaoManutencaoData} />
      <ManutencaoRequisicaoDemandInfo data={requisicaoManutencaoData} />
      <ManutencaoRequisicaoHistoricoStatus data={requisicaoManutencaoData} />
      <ManutencaoRequisicaoFluxoServico data={requisicaoManutencaoData} />
      <ManutencaoRequisicaoListaMateriais data={requisicaoManutencaoData} />
      <ManutencaoRequisicaoAnexos data={requisicaoManutencaoData} />
      <ManutencaoRequisicaoEstatisticas data={requisicaoManutencaoData} />
    </div>
  );
}
