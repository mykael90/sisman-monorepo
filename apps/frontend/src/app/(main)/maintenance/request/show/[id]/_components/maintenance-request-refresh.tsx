'use client';

import { format } from 'date-fns';
import { Button } from '../../../../../../../components/ui/button';
import { IMaintenanceRequestShowWithRelations } from '../../../maintenance-request-types';
import { RefreshCcw } from 'lucide-react';
import { fetchOneAndPersistSipacRequisicoesManutencao } from '../../../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-actions';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { getRefreshedMaintenanceRequestShow } from '../../../maintenance-request-actions';

export function MaintenanceRequestRefreshButton({
  data
}: {
  data: IMaintenanceRequestShowWithRelations;
}) {
  const [isPendingTransition, startTransition] = useTransition();

  const scrapeOrUpdateRequisicaoManutencaoSipac = async (
    formattedProtocolNumber: string,
    id: number
  ) => {
    const scrapingRequisicaoManutencaoSipac =
      await fetchOneAndPersistSipacRequisicoesManutencao(
        formattedProtocolNumber
      );
    if (scrapingRequisicaoManutencaoSipac) {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

      // setMaintenanceRequestData(scrapingRequisicaoManutencaoSipac);
      console.log(
        'Requisição de manutenção importada do SIPAC:',
        scrapingRequisicaoManutencaoSipac
      );
      startTransition(() => {
        //Uso de recursividade, como foi bem sucedido, vai localizar corretamente e vai exibir em tela na próxima chamada
        toast.success(
          `Requisição de manutenção nº ${formattedProtocolNumber} importada do SIPAC com sucesso!`
        );
        getRefreshedMaintenanceRequestShow(id);
      });
    } else {
      toast.error(
        `Falha ao importar requisição de manutenção nº ${formattedProtocolNumber} do SIPAC. Verifique os dados e tente novamente.`
      );
    }
  };
  return (
    <div className='gap-4 lg:flex'>
      {data?.origin === 'SIPAC' ? (
        <div className='flex flex-col self-end'>
          <div className='text-muted-foreground pb-1 text-center text-sm'>
            Última sincronização: <br />
            Requisição de Manutenção <br />
            {format(new Date(data?.updatedAt), 'dd/MM/yyyy HH:mm')}
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isPendingTransition}
            onClick={() => {
              console.log('Sincronizando com SIPAC...');
              startTransition(() => {
                scrapeOrUpdateRequisicaoManutencaoSipac(
                  data.protocolNumber,
                  data.id
                );
              });
            }}
          >
            <RefreshCcw className='mr-2 h-4 w-4' /> Sincronizar com SIPAC
          </Button>
          {/* <div>
                {isPendingTransition && (
                  <div className='text-muted-foreground pt-1 text-xs'>
                    Aguarde...
                  </div>
                )}
              </div> */}
        </div>
      ) : null}
    </div>
  );
}
