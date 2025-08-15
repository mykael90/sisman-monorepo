'use client';

import { useState } from 'react';
import { ImportarRequisicaoSipacForm } from '../_components/importar-requisicao/importar-requisicao-sipac-form';
import { ISipacRequisicaoManutencaoWithRelations } from '../requisicoes-manutencoes-types';
import { ManutencaoDadosSipacDisplay } from '../_components/importar-requisicao/manutencao-dados-sipac-display';

export default function Page() {
  const [manutencaoDadosSipac, setManutencaoDadosSipac] =
    useState<ISipacRequisicaoManutencaoWithRelations | null>(null);
  return (
    <div className='container mx-auto space-y-6 p-4'>
      <ImportarRequisicaoSipacForm
        setManutencaoDadosSipac={setManutencaoDadosSipac}
      ></ImportarRequisicaoSipacForm>
      {manutencaoDadosSipac && (
        <ManutencaoDadosSipacDisplay data={manutencaoDadosSipac} />
      )}
    </div>
  );
}
