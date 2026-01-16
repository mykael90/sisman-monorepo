import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { Package, ClipboardList } from 'lucide-react';

interface ManutencaoRequisicaoEstatisticasProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoEstatisticas({
  data
}: ManutencaoRequisicaoEstatisticasProps) {
  const servicoCount = data.informacoesServico?.length || 0;
  const materialRequestCount = data.requisicoesMateriais?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Estatísticas da Requisição</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='flex items-center space-x-2'>
          <ClipboardList className='text-muted-foreground h-5 w-5' />
          <div>
            <p className='text-sm font-medium'>Serviços Registrados:</p>
            <p className='text-lg font-bold'>{servicoCount}</p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Package className='text-muted-foreground h-5 w-5' />
          <div>
            <p className='text-sm font-medium'>Requisições de Material:</p>
            <p className='text-lg font-bold'>{materialRequestCount}</p>
          </div>
        </div>
        {/* Adicione mais estatísticas conforme necessário */}
      </CardContent>
    </Card>
  );
}
