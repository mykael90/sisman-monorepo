import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { FileText } from 'lucide-react';

interface ManutencaoRequisicaoAnexosProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoAnexos({
  data
}: ManutencaoRequisicaoAnexosProps) {
  if (!data.arquivos || data.arquivos.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Anexos</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {data.arquivos.map((arquivo: any) => (
          <div key={arquivo.id} className='flex items-center space-x-2'>
            <FileText className='text-muted-foreground h-5 w-5' />
            <a
              href={arquivo.url || '#'}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline'
            >
              {arquivo.nome || 'Arquivo sem nome'}
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
