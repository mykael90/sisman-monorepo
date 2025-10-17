'use client';
import { useState } from 'react';
import {
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderRelatedData
} from '../../material-picking-order-types';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { addMaterialPickingOrder } from '../../material-picking-order-actions';
import { MaterialPickingOrderForm } from '../form/material-picking-order-form';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FilePlus, ListPlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import { startOfDay } from 'date-fns';

export function MaterialPickingOrderAdd({
  relatedData
}: {
  relatedData: IMaterialPickingOrderRelatedData;
}) {
  const { session } = relatedData;

  // --- 1. CHAMAR TODOS OS HOOKS NO TOPO, INCONDICIONALMENTE ---
  const { warehouse } = useWarehouseContext();

  const router = useRouter();

  const redirectList = () => {
    router.push('/material/picking-order/');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerReset = () => {
    setFormKey(Date.now().toString());
  };

  // A verificação `!userId` também protege contra o valor `NaN`.
  if (!warehouse?.id) {
    return <p>Acesso negado. Por favor, selecione um almoxarifado.</p>;
  }

  //default dia seguinte
  const desiredPickupDate = startOfDay(new Date());
  desiredPickupDate.setDate(desiredPickupDate.getDate() + 1);

  const defaultData: Partial<Record<keyof IMaterialPickingOrderAddForm, any>> =
    {
      warehouseId: warehouse.id,
      desiredPickupDate,
      maintenanceRequestId: undefined,
      materialRequestId: undefined,
      beCollectedByUserId: '',
      beCollectedByWorkerId: '',
      collectedByOther: '',
      items: [],
      notes: undefined,
      collectorType: 'worker',
      legacy_place: undefined,
      requestedByUserId: session?.user.idSisman
    };

  // --- 3. O RESTO DO SEU COMPONENTE ---
  // A partir daqui, você tem a garantia de que `session` e `warehouseId` existem e `userId` é um número válido.

  return (
    <div className='space-y-6'>
      {/* Formulário de reserva */}

      <SectionListHeaderSmall
        title='Reserva de Materiais'
        subtitle='Sistema de reserva de materiais'
        TitleIcon={ListPlus}
        actionButton={{
          text: 'Voltar para listagem',
          // onClick: handleAddWithdrawal,
          onClick: () => router.push('/material/picking-order/'),
          variant: 'outline',
          Icon: ArrowLeft
        }}
      />

      <MaterialPickingOrderForm
        key={formKey}
        onClean={triggerReset}
        onCancel={redirectList}
        relatedData={relatedData}
        SubmitButtonIcon={FilePlus}
        submitButtonText='Realizar Reserva'
        defaultData={defaultData}
        formActionProp={addMaterialPickingOrder}
      />
    </div>
  );
}
