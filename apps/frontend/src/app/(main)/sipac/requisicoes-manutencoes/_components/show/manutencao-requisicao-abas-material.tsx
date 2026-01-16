import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISipacRequisicaoManutencaoShow } from '../../requisicoes-manutencoes-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge';

interface ManutencaoRequisicaoAbasMaterialProps {
  data: ISipacRequisicaoManutencaoShow;
}

export function ManutencaoRequisicaoAbasMaterial({
  data
}: ManutencaoRequisicaoAbasMaterialProps) {
  if (!data.requisicoesMateriais || data.requisicoesMateriais.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Requisições de Material</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='requisicao-0'>
          <TabsList className='flex h-auto flex-wrap'>
            {data.requisicoesMateriais.map((requisicao, index) => (
              <TabsTrigger
                key={requisicao.id}
                value={`requisicao-${index}`}
                className='text-wrap whitespace-normal'
              >
                RM: {requisicao.numeroDaRequisicao} - {requisicao.statusAtual}
              </TabsTrigger>
            ))}
          </TabsList>
          {data.requisicoesMateriais.map((requisicao, index) => (
            <TabsContent key={requisicao.id} value={`requisicao-${index}`}>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <p className='font-semibold'>Número da Requisição:</p>
                    <p>{requisicao.numeroDaRequisicao}</p>
                  </div>
                  <div>
                    <p className='font-semibold'>Tipo da Requisição:</p>
                    <p>{requisicao.tipoDaRequisicao}</p>
                  </div>
                  <div>
                    <p className='font-semibold'>Grupo de Material:</p>
                    <p>{requisicao.grupoDeMaterial}</p>
                  </div>
                  <div>
                    <p className='font-semibold'>Almoxarifado:</p>
                    <p>{requisicao.almoxarifado}</p>
                  </div>
                  <div>
                    <p className='font-semibold'>Status Atual:</p>
                    <Badge variant='outline'>{requisicao.statusAtual}</Badge>
                  </div>
                  <div>
                    <p className='font-semibold'>Data de Cadastro:</p>
                    <p>
                      {requisicao.dataDeCadastro
                        ? format(
                            new Date(requisicao.dataDeCadastro),
                            'dd/MM/yyyy HH:mm',
                            { locale: ptBR }
                          )
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='font-semibold'>Valor da Requisição:</p>
                    <p>
                      {requisicao.valorDaRequisicao
                        ? parseFloat(
                            requisicao.valorDaRequisicao.toString()
                          ).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='font-semibold'>Valor Total Atendido:</p>
                    <p>
                      {requisicao.valorDoTotalAtendido
                        ? parseFloat(
                            requisicao.valorDoTotalAtendido.toString()
                          ).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='font-semibold'>Local:</p>
                    <p>{requisicao.local || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='font-semibold'>Usuário Login:</p>
                    <p>{requisicao.usuarioLogin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='font-semibold'>Observações:</p>
                    <p>{requisicao.observacoes || 'Nenhuma'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
