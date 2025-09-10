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
import { IMaterialRequestWithRelations } from '../../../../request/material-request-types';
import { RequestMaterialForm } from '../form/request-material-form';
import { materialReceiptFormSchemaAdd } from '../form/material-receipt-form-validation';

export function MaterialReceiptAdd({
  relatedData
}: {
  relatedData: IMaterialReceiptRelatedData;
}) {
  const { session } = relatedData;

  const { warehouse } = useWarehouseContext();

  const [movementTypeCode, setMovementTypeCode] =
    useState<MaterialOperationInKey>(materialOperationInDisplayMap.IN_CENTRAL);

  const [materialRequestsData, setMaterialRequestsData] = useState<
    IMaterialRequestWithRelations[] | null
  >(null);

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

  if (movementTypeCode === materialOperationInDisplayMap.IN_CENTRAL) {
    return (
      <div className='space-y-6'>
        <TabSelector
          movementTypeCode={movementTypeCode}
          setMovementTypeCode={setMovementTypeCode}
          handleReset={triggerReset}
        />

        <RequestMaterialForm
          // key={formKey}
          setMaterialRequestsData={setMaterialRequestsData}
          materialRequestsData={materialRequestsData}
        />

        {materialRequestsData &&
          materialRequestsData.map((materialRequest) => (
            <div className='space-y-4 rounded-md border py-4'>
              {JSON.stringify(materialRequest, null, 2)}
              <div className='ps-4 text-lg font-bold'>
                Requisição: {materialRequest.protocolNumber}
              </div>
              <MaterialReceiptForm
                key={formKey + materialRequest.id}
                onClean={triggerReset}
                onCancel={redirectList}
                relatedData={relatedData}
                SubmitButtonIcon={FilePlus}
                submitButtonText='Realizar Entrada'
                defaultData={{
                  ...defaultData,
                  materialRequestId: materialRequest.id,
                  items: materialRequest.items.map((item) => ({
                    materialId: item.requestedGlobalMaterialId,
                    quantityExpected: item.quantityApproved,
                    quantityRejected: 0,
                    quantityReceived: item.quantityApproved,
                    materialRequestItemId: item.id,
                    unitPrice: item.unitPrice
                      ? Number(item.unitPrice)
                      : undefined
                  }))
                }}
                formActionProp={addReceipt}
                movementTypeCode={movementTypeCode}
              />
            </div>
          ))}
      </div>
    );
  }

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
        formSchema={materialReceiptFormSchemaAdd}
      />
    </div>
  );
}
