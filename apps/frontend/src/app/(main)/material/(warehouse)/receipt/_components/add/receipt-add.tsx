'use client';
import { useState } from 'react';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptRelatedData
} from '../../receipt-types';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { TabSelector } from './tab-selector';
import {
  materialOperationInDisplayMap,
  MaterialOperationInKey
} from '@/mappers/material-operations-mappers';
import { addReceipt } from '../../receipt-actions';
import { MaterialReceiptForm } from '../form/material-receipt-form';
import { useRouter } from 'next/navigation';
import { FilePlus } from 'lucide-react';

export function MaterialReceiptAdd({
  relatedData
}: {
  relatedData: IMaterialReceiptRelatedData;
}) {
  const { session } = relatedData;

  const { warehouse } = useWarehouseContext();

  const [movementTypeCode, setMovementTypeCode] =
    useState<MaterialOperationInKey>(materialOperationInDisplayMap.IN_CENTRAL);

  const router = useRouter();

  const redirectList = () => {
    router.push('/material/receipt/');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerReset = () => {
    setFormKey(Date.now().toString());
  };

  if (!warehouse?.id) {
    return <p>Acesso negado. Por favor, selecione um almoxarifado.</p>;
  }

  const defaultData: Partial<Record<keyof IMaterialReceiptAddForm, any>> = {
    destinationWarehouseId: warehouse.id,
    receiptDate: new Date(),
    processedByUserId: session?.user?.idSisman,
    movementTypeCode: movementTypeCode,
    items: [],
    notes: undefined,
    sourceName: undefined,
    externalReference: undefined
  };

  return (
    <div className='space-y-6'>
      <TabSelector
        movementTypeCode={movementTypeCode}
        setMovementTypeCode={setMovementTypeCode}
        handleReset={triggerReset}
      />
      <MaterialReceiptForm
        key={formKey}
        onClean={triggerReset}
        onCancel={redirectList}
        relatedData={relatedData}
        SubmitButtonIcon={FilePlus}
        submitButtonText='Realizar Entrada'
        defaultData={defaultData}
        formActionProp={addReceipt}
        movementTypeCode={movementTypeCode}
      />
    </div>
  );
}
