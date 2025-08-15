'use client';

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition
} from 'react';
import { ImportarRequisicaoSipacForm } from '../_components/importar-requisicao/importar-requisicao-sipac-form';
import { ISipacRequisicaoManutencaoWithRelations } from '../requisicoes-manutencoes-types';
import { ManutencaoDadosSipacDisplay } from '../_components/importar-requisicao/manutencao-dados-sipac-display';
import { Button } from '@/components/ui/button';
import { IActionResultForm } from '@/types/types-server-actions';
import { persistSipacRequisicoesManutencao } from '../requisicoes-manutencoes-actions';
import { toast } from 'sonner';

const initialServerStateImportData: IActionResultForm<
  ISipacRequisicaoManutencaoWithRelations,
  ISipacRequisicaoManutencaoWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

export default function Page() {
  const [manutencaoDadosSipac, setManutencaoDadosSipac] =
    useState<ISipacRequisicaoManutencaoWithRelations | null>(null);

  const [serverStateDataImport, formActionDataImport, isPendingDataImport] =
    useActionState(
      persistSipacRequisicoesManutencao,
      initialServerStateImportData
    );

  const [isPendingTransition, startTransition] = useTransition();

  const lastMessageRef = useRef('');

  useEffect(() => {
    if (!isPendingDataImport && serverStateDataImport?.message) {
      if (serverStateDataImport.message !== lastMessageRef.current) {
        if (serverStateDataImport.isSubmitSuccessful) {
          toast.success(serverStateDataImport.message);
        } else {
          toast.error(serverStateDataImport.message);
        }
        lastMessageRef.current = serverStateDataImport.message;
      }
    }
  }, [isPendingDataImport, serverStateDataImport, setManutencaoDadosSipac]);

  return (
    <div className='container mx-auto space-y-12 p-4 md:p-6'>
      {/* 1. Cabeçalho principal da página */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Importar Requisição do SIPAC
        </h1>
        <p className='text-muted-foreground'>
          Siga os passos abaixo para buscar e importar uma requisição de
          manutenção do SIPAC para o SISMAN.
        </p>
      </div>

      {/* 2. Seção do Passo 1 */}
      <div className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-semibold tracking-tight'>
            Buscar Requisição
          </h2>
          <p className='text-muted-foreground text-sm'>
            Insira o número da requisição para carregar os dados do SIPAC.
          </p>
        </div>
        <ImportarRequisicaoSipacForm
          setManutencaoDadosSipac={setManutencaoDadosSipac}
        />
      </div>

      {/* 3. Seção do Passo 2: Aparece condicionalmente */}
      {manutencaoDadosSipac && (
        <div className='space-y-6'>
          {/* Cabeçalho do Passo 2 com a ação de importação */}
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='space-y-1'>
              <h2 className='text-2xl font-semibold tracking-tight'>
                Confirmar Dados e Importar
              </h2>
              <p className='text-muted-foreground text-sm'>
                Confira as informações abaixo e clique em &quot;Confirmar
                Importação&quot; para concluir.
              </p>
            </div>
            <Button
              size='lg'
              onClick={() => {
                if (manutencaoDadosSipac) {
                  startTransition(() => {
                    formActionDataImport(manutencaoDadosSipac);
                  });
                }
              }}
              disabled={isPendingDataImport}
              className='w-full sm:w-auto' // Botão ocupa largura total em telas pequenas
            >
              {isPendingDataImport ? 'Importando...' : 'Confirmar Importação'}
            </Button>
          </div>

          {/* Componente que exibe os detalhes da requisição */}
          <ManutencaoDadosSipacDisplay data={manutencaoDadosSipac} />
        </div>
      )}
    </div>
  );
}
