'use client';

import { useTransition } from 'react';
import { IMaterialRequestShowWithRelations } from '../../material-request-types';
import { handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada } from '../../../../sipac/requisicoes-materiais/requisicoes-materiais-actions';
import { toast } from 'sonner';
import { getRefreshedMaterialRequestShow } from '../../material-request-actions';
import { format } from 'date-fns';
import { Button } from '../../../../../../components/ui/button';
import { RefreshCcw } from 'lucide-react';

export function MaterialRequestRefreshButton({
  data
}: {
  data: IMaterialRequestShowWithRelations;
}) {
  const [isPendingTransition, startTransition] = useTransition();

  const scrapeOrUpdateRequisicaoMaterialSipac = async (
    formattedProtocolNumber: string,
    id: number
  ) => {
    const scrapingRequisicaoMaterialSipac =
      await handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada(
        formattedProtocolNumber
      );
    if (scrapingRequisicaoMaterialSipac) {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

      // setMaterialRequestData(scrapingRequisicaoMaterialSipac);
      console.log(
        'Requisição de material sincronizada do SIPAC:',
        scrapingRequisicaoMaterialSipac
      );
      startTransition(() => {
        //Uso de recursividade, como foi bem sucedido, vai localizar corretamente e vai exibir em tela na próxima chamada
        toast.success(
          `Requisição de material nº ${formattedProtocolNumber} sincronizada do SIPAC com sucesso!`
        );
        getRefreshedMaterialRequestShow(id);
      });
    } else {
      toast.error(
        `Falha ao sincronizar requisição de material nº ${formattedProtocolNumber} do SIPAC. Verifique os dados e tente novamente.`
      );
    }
  };

  return (
    <div className='gap-4 lg:flex'>
      {data?.origin === 'SIPAC' ? (
        <div className='flex flex-col self-end'>
          <div className='text-muted-foreground pb-1 text-center text-sm'>
            Última sincronização: <br />
            Requisição de Material <br />
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
                scrapeOrUpdateRequisicaoMaterialSipac(
                  data.protocolNumber,
                  data.id
                );
              });
            }}
          >
            <RefreshCcw className='mr-2 h-4 w-4' /> Sincronizar com SIPAC
          </Button>
          <div>
            {isPendingTransition && (
              <div className='text-muted-foreground pt-1 text-xs'>
                Aguarde...
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
