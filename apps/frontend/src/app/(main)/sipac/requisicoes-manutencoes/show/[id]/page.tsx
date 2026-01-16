import { notFound } from 'next/navigation';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { showSipacRequisicaoManutencao } from '../../requisicoes-manutencoes-actions';
import { ManutencaoRequisicaoHeader } from '../../_components/show/manutencao-requisicao-header';
import { ManutencaoRequisicaoGeralInfo } from '../../_components/show/manutencao-requisicao-geral-info';

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
    </div>
  );
}
