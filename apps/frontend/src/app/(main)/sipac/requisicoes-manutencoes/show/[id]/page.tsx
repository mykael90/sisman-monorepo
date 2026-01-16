import { notFound } from 'next/navigation';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { showSipacRequisicaoManutencao } from '../../requisicoes-manutencoes-actions';

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
      Vamos mostrar as informações da requisição de id ${id} de manutenção aqui!
      {requisicaoManutencaoData &&
        JSON.stringify(requisicaoManutencaoData, null, 2)}
    </div>
  );
}
