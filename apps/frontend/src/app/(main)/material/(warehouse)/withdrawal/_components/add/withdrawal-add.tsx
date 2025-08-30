'use client';
import { useState } from 'react';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalRelatedData
} from '../../withdrawal-types';
import { IMaterialRequestWithRelations } from '../../../../request/material-request-types';
import { IMaintenanceRequestWithRelations } from '../../../../../maintenance/request/request-types';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { TabSelector } from '../add/tab-selector';
import {
  materialOperationOutDisplayMap,
  MaterialOperationOutKey
} from '../../../../../../../mappers/material-operations-mappers';
import { addWithdrawal } from '../../withdrawal-actions';
import { MaterialWithdrawalForm } from '../form/material-withdrawal-form';
import { useRouter } from 'next/navigation';
import { FilePlus, UserPlus } from 'lucide-react';
import { RequestMaintenanceForm } from '../form/request-maintenance-form';
import { RequestMaterialForm } from '../form/request-material-form';

export function MaterialWithdrawalAdd({
  relatedData
}: {
  relatedData: IMaterialWithdrawalRelatedData;
}) {
  const { session } = relatedData;

  // --- 1. CHAMAR TODOS OS HOOKS NO TOPO, INCONDICIONALMENTE ---
  const { warehouse } = useWarehouseContext();

  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestWithRelations | null>(null);

  const [materialRequestData, setMaterialRequestData] =
    useState<IMaterialRequestWithRelations | null>(null);

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
    setMaintenanceRequestData(null);
    setMaterialRequestData(null);
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
      {/* Formulário para fazer consulta de requisição de manutenção ou material */}
      {movementTypeCode ===
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE && (
        <RequestMaterialForm
          // key={formKey}
          setMaintenanceRequestData={setMaintenanceRequestData}
          maintenanceRequestData={maintenanceRequestData}
          setMaterialRequestData={setMaterialRequestData}
          materialRequestData={materialRequestData}
        />
      )}
      {/* Formulário de retirada */}
      <MaterialWithdrawalForm
        key={formKey}
        onClean={triggerReset}
        onCancel={redirectList}
        relatedData={relatedData}
        SubmitButtonIcon={UserPlus}
        submitButtonText='Realizar Retirada'
        defaultData={defaultData}
        formActionProp={addWithdrawal}
        maintenanceRequestData={maintenanceRequestData}
        materialRequestData={materialRequestData}
        movementTypeCode={movementTypeCode}
        //
        // withdrawalType={withdrawalType}
      />
    </div>
  );
}
