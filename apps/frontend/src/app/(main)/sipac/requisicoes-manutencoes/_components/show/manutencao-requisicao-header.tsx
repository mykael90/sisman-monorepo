'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionListHeaderSmallMultipleButtons } from '../../../../../../components/section-list-header-small-multiple-buttons';

export function ManutencaoRequisicaoHeader() {
  const router = useRouter();

  return (
    <SectionListHeaderSmallMultipleButtons
      title='Detalhes da Requisição de Manutenção - ORIGEM SIPAC'
      subtitle='Informações sobre status, requisições de
            materiais vinculadas, ordens de serviço, entre outros, relativa à requisição de manutenção
            específica de origem exclusivamente no SIPAC.'
      TitleIcon={ClipboardList}
      actionButtons={[
        {
          text: 'Voltar',
          onClick: () => {
            router.back();
          },
          variant: 'default',
          Icon: ArrowLeft
        }
      ]}
    />
  );
}
