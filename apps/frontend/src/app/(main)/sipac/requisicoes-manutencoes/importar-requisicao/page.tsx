'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
    <div className='container mx-auto space-y-6 p-4'>
      <ImportarRequisicaoSipacForm
        setManutencaoDadosSipac={setManutencaoDadosSipac}
      ></ImportarRequisicaoSipacForm>
      <Button
        onClick={() => {
          console.log('Dados da manutenção:', manutencaoDadosSipac);
          if (manutencaoDadosSipac) {
            formActionDataImport(manutencaoDadosSipac);
          }
        }}
      >
        Importar
      </Button>
      {manutencaoDadosSipac && (
        <ManutencaoDadosSipacDisplay data={manutencaoDadosSipac} />
      )}
    </div>
  );
}
