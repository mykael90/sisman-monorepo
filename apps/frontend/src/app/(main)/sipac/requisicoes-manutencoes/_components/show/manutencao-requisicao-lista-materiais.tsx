import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';

interface ManutencaoRequisicaoListaMateriaisProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoListaMateriais({
  data
}: ManutencaoRequisicaoListaMateriaisProps) {
  if (!data.requisicoesMateriais || data.requisicoesMateriais.length === 0) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-8 text-center'>
          Nenhuma requisição de material vinculada.
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return numValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Requisições de Material</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {data.requisicoesMateriais.map((requisicao) => (
          <Card key={requisicao.id} className='overflow-hidden shadow-sm'>
            <CardHeader className='bg-gray-50 py-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div>
                  <CardTitle className='text-md'>
                    RM: {requisicao.numeroDaRequisicao}
                  </CardTitle>
                  <p className='text-sm text-gray-500'>
                    ID: {requisicao.id} &bull; Data:{' '}
                    {requisicao.dataDeCadastro
                      ? format(
                          new Date(requisicao.dataDeCadastro),
                          'dd/MM/yyyy'
                        )
                      : 'N/A'}
                  </p>
                </div>
                <div className='text-sm font-medium'>
                  <Badge variant='secondary' className='text-xs'>
                    Status: {requisicao.statusAtual}
                  </Badge>
                </div>
              </div>
              <div className='mt-2 flex flex-wrap gap-2'>
                <Badge variant='outline' className='text-xs'>
                  Tipo: {requisicao.tipoDaRequisicao || 'N/A'}
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Grupo: {requisicao.grupoDeMaterial || 'N/A'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='p-4'>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                <div>
                  <p className='text-xs font-medium text-gray-500'>
                    Almoxarifado de Destino
                  </p>
                  <p className='font-medium'>
                    {requisicao.almoxarifado || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500'>
                    Solicitado por
                  </p>
                  <p className='font-medium'>
                    {requisicao.usuarioLogin || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500'>
                    Valor da Requisição
                  </p>
                  <p className='font-medium'>
                    {formatCurrency(requisicao.valorDaRequisicao?.toString())}
                  </p>
                </div>
                {requisicao.valorDoTotalAtendido && (
                  <div>
                    <p className='text-xs font-medium text-gray-500'>
                      Valor Total Atendido
                    </p>
                    <p className='font-medium'>
                      {formatCurrency(
                        requisicao.valorDoTotalAtendido.toString()
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-xs font-medium text-gray-500'>Local</p>
                  <p className='font-medium'>{requisicao.local || 'N/A'}</p>
                </div>
              </div>

              {requisicao.itensDaRequisicao &&
                requisicao.itensDaRequisicao.length > 0 && (
                  <div className='mt-4 border-t pt-4'>
                    <p className='mb-2 text-sm font-medium'>
                      Itens da Requisição de Material (
                      {requisicao.itensDaRequisicao.length})
                    </p>
                    <div className='rounded-md border'>
                      <Table className='text-xs'>
                        <TableHeader className='bg-gray-100'>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Qtd. Sol.</TableHead>
                            <TableHead>Qtd. Atend.</TableHead>
                            <TableHead>Valor Unitário</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requisicao.itensDaRequisicao.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.numeroItem}</TableCell>
                              <TableCell>{item.codigo}</TableCell>
                              <TableCell>
                                {item.quantidade.toString()}
                              </TableCell>
                              <TableCell>
                                {item.quantidadeAtendida.toString()}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(item.valor?.toString())}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(item.total?.toString())}
                              </TableCell>
                              <TableCell>
                                <Badge variant='outline'>
                                  {item.status?.toString()}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

              {requisicao.observacoes && (
                <div className='mt-4 border-t pt-4'>
                  <p className='text-xs font-medium text-gray-500'>
                    Observações da Requisição
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    {requisicao.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
