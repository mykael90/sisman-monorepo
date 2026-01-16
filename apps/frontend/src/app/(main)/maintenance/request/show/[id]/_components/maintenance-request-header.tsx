'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionListHeaderSmallMultipleButtons } from '../../../../../../../components/section-list-header-small-multiple-buttons';

export function MaintenanceRequestHeader() {
  const router = useRouter();

  return (
    <SectionListHeaderSmallMultipleButtons
      title='Detalhes da Requisição de Manutenção'
      subtitle='Informações sobre status, movimentações de materiais, requisições de
            materiais vinculadas, ordens de serviço, instâncias associadas,
            diagnósticos, entre outros, relativa à requisição de manutenção
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
