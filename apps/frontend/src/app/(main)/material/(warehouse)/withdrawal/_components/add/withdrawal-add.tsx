'use client';
import { useState } from 'react';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalRelatedData
} from '../../withdrawal-types';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { TabSelector } from '../add/tab-selector';
import {
  materialOperationOutDisplayMap,
  MaterialOperationOutKey
} from '@/mappers/material-operations-mappers';
import { addWithdrawal } from '../../withdrawal-actions';
import { MaterialWithdrawalForm } from '../form/material-withdrawal-form';
import { useRouter } from 'next/navigation';
import { FilePlus } from 'lucide-react';

export function MaterialWithdrawalAdd({
  relatedData
}: {
  relatedData: IMaterialWithdrawalRelatedData;
}) {
  const { session } = relatedData;

  // --- 1. CHAMAR TODOS OS HOOKS NO TOPO, INCONDICIONALMENTE ---
  const { warehouse } = useWarehouseContext();

  const [movementTypeCode, setMovementTypeCode] =
    useState<MaterialOperationOutKey>(
      materialOperationOutDisplayMap.OUT_SERVICE_USAGE
    );

  const router = useRouter();

  const redirectList = () => {
    router.push('/material/withdrawal/');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerReset = () => {
    setFormKey(Date.now().toString());
  };

  // A verificação `!userId` também protege contra o valor `NaN`.
  if (!warehouse?.id) {
    return <p>Acesso negado. Por favor, selecione um almoxarifado.</p>;
  }

  const defaultData: Partial<Record<keyof IMaterialWithdrawalAddForm, any>> = {
    warehouseId: warehouse.id,
    withdrawalDate: new Date(),
    maintenanceRequestId: undefined,
    materialRequestId: undefined,
    materialPickingOrderId: undefined,
    processedByUserId: session?.user?.idSisman,
    authorizedByUserId: undefined,
    collectedByWorkerId: '',
    collectedByUserId: '',
    collectedByOther: null,
    movementTypeCode: movementTypeCode,
    items: [],
    notes: undefined,
    collectorType: 'worker',
    legacy_place: undefined
  };

  // --- 3. O RESTO DO SEU COMPONENTE ---
  // A partir daqui, você tem a garantia de que `session` e `warehouseId` existem e `userId` é um número válido.

  return (
    <div className='space-y-6'>
      {/* Tab Selector do tipo de saída */}
      <TabSelector
        movementTypeCode={movementTypeCode}
        setMovementTypeCode={setMovementTypeCode}
        handleReset={triggerReset}
      />
      {/* Formulário de retirada */}
      <MaterialWithdrawalForm
        key={formKey}
        onClean={triggerReset}
        onCancel={redirectList}
        relatedData={relatedData}
        SubmitButtonIcon={FilePlus}
        submitButtonText='Realizar Retirada'
        defaultData={defaultData}
        formActionProp={addWithdrawal}
        movementTypeCode={movementTypeCode}
        //
        // withdrawalType={withdrawalType}
      />
    </div>
  );
}
