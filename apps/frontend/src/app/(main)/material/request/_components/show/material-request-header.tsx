'use client';

import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionListHeaderSmallMultipleButtons } from '../../../../../../components/section-list-header-small-multiple-buttons';

export function MaterialRequestHeader() {
  const router = useRouter();

  return (
    <SectionListHeaderSmallMultipleButtons
      title='Detalhes da Requisição de Material'
      subtitle='            Informações sobre status, movimentações de materiais, manutenção
            vinculada, entre outros, relativa à requisição de material
            específica.'
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
