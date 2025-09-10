'use client';
import { useState } from 'react';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptItemAddForm,
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
import { Item } from '@radix-ui/react-select';
import { IMaterialReceiptItemAddFormInfo } from '../form/table-form-items-material-request';

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
          materialRequestsData.map((materialRequest) => {
            let materialState: IMaterialReceiptItemAddForm[] = [];

            let materialInfo: IMaterialReceiptItemAddFormInfo[] = [];

            materialRequest.items.forEach((item) => {
              const key = Date.now() + Math.random();

              const quantityExpected =
                Number(item.quantityApproved ?? 0) -
                Number(item.quantityDelivered ?? 0) +
                Number(item.quantityReturned ?? 0);

              materialState.push({
                key: key,
                materialId: String(item.requestedGlobalMaterialId),
                quantityExpected: quantityExpected,
                quantityRejected: 0,
                quantityReceived: quantityExpected,
                materialRequestItemId: item.id,
                unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined
              });

              materialInfo.push({
                key: key,
                materialId: String(item.requestedGlobalMaterialId),
                name: item.requestedGlobalMaterial?.name || 'sem nome',
                description:
                  item.requestedGlobalMaterial?.description || 'sem descrição',
                unitOfMeasure:
                  item.requestedGlobalMaterial?.unitOfMeasure ||
                  'sem unidade de medida',
                quantityRequested: item.quantityRequested,
                quantityApproved: item.quantityApproved,
                quantityDelivered: item.quantityDelivered,
                quantityReturned: item.quantityReturned
              });
            });

            // const materialState

            return (
              <div className='space-y-4 rounded-md border py-4'>
                {JSON.stringify(materialRequest, null, 2)}
                <div className='ps-4 text-lg font-bold'>
                  Requisição: {materialRequest.protocolNumber}
                </div>
                <MaterialReceiptForm
                  key={formKey + materialRequest.id}
                  onClean={triggerReset}
                  onCancel={redirectList}
                  relatedData={{ ...relatedData, materialRequest }}
                  SubmitButtonIcon={FilePlus}
                  submitButtonText='Realizar Entrada'
                  defaultData={{
                    ...defaultData,
                    materialRequestId: materialRequest.id,
                    items: materialState
                  }}
                  formActionProp={addReceipt}
                  movementTypeCode={movementTypeCode}
                  // formSchema={materialReceiptFormSchemaAdd}
                  materialInfo={materialInfo}
                />
              </div>
            );
          })}
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
