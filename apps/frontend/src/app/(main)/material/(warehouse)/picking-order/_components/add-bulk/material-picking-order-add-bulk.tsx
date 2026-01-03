'use client';
import { ArrowLeft, FilePlus, ListPlus } from 'lucide-react';
import { SectionListHeaderSmall } from '../../../../../../../components/section-list-header-small';
import {
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderItemAddForm,
  IMaterialPickingOrderRelatedData
} from '../../material-picking-order-types';
import { useRouter } from 'next/navigation';
import {
  RadioGroup,
  RadioGroupItem
} from '../../../../../../../components/ui/radio-group';
import { Label } from '../../../../../../../components/ui/label';
import { RequestMaintenanceForm } from '../../../withdrawal/_components/form/request-maintenance-form';
import { useState } from 'react';
import { IMaintenanceRequestBalanceWithRelations } from '../../../../../maintenance/request/maintenance-request-types';
import { IMaterialRequestBalanceWithRelations } from '../../../../request/material-request-types';
import {
  IItemPickingOrderMaterialRequestForm,
  IMaterialRequestBalanceWithRelationsForm
} from '../card-material-link-details';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { startOfDay } from 'date-fns';
import { RequestMaterialFormBulk } from '../form/request-material-form-bulk';
import { addMaterialPickingOrder } from '../../material-picking-order-actions';
import { MaterialPickingOrderFormBulk } from '../form/material-picking-order-form-bulk';

export function MaterialPickingOrderAddBulk({
  relatedData
}: {
  relatedData: IMaterialPickingOrderRelatedData;
}) {
  const { session, listUsers, listWorkers } = relatedData;

  // --- 1. CHAMAR TODOS OS HOOKS NO TOPO, INCONDICIONALMENTE ---
  const { warehouse } = useWarehouseContext();

  const router = useRouter();

  const redirectList = () => {
    router.push('/material/picking-order/');
  };

  //array de estado para armazenar varias requisicoes de material
  const [
    defaultDataMaterialsPickingOrders,
    setDefaultDataMaterialsPickingOrders
  ] = useState<
    Array<{
      maintenanceRequestData: IMaintenanceRequestBalanceWithRelations | null;
      materialRequestData: IMaterialRequestBalanceWithRelations | null;
      materialRequestBalance: IMaterialRequestBalanceWithRelationsForm | null;
      details: any;
    }>
  >([]);

  const [formKey, setFormKey] = useState(() => Date.now().toString());

  const triggerReset = () => {
    setFormKey(Date.now().toString());
  };

  const handleRemoveMaterialPickingOrder = (index: number) => {
    const newDefaultDataMaterialsPickingOrders = [
      ...defaultDataMaterialsPickingOrders
    ];
    newDefaultDataMaterialsPickingOrders.splice(index, 1);
    setDefaultDataMaterialsPickingOrders(newDefaultDataMaterialsPickingOrders);
  };

  // A verificação `!userId` também protege contra o valor `NaN`.
  if (!warehouse?.id) {
    return <p>Acesso negado. Por favor, selecione um almoxarifado.</p>;
  }

  const [requestSearchType, setRequestSearchType] = useState<
    'material' | 'maintenance' | 'none'
  >('material');

  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestBalanceWithRelations | null>(null);

  const [materialRequestData, setMaterialRequestData] =
    useState<IMaterialRequestBalanceWithRelations | null>(null);

  const [linkMaterialRequest, setLinkMaterialRequest] =
    useState<boolean>(false);

  const cleanFormAndStates = () => {
    //não dispara mudança da key do componente, mais contido
    // formPickingOrder.reset();
    setMaintenanceRequestData(null);
    setMaterialRequestData(null);
    // setLinkMaterialRequest(false);
  };

  return (
    <div className='space-y-6'>
      {/* Formulário de reserva */}
      <SectionListHeaderSmall
        title='Reserva de Materiais em Lote'
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

      {/* <RadioGroup
        defaultValue={requestSearchType}
        onValueChange={(value) => {
          cleanFormAndStates();
          setRequestSearchType(value as any);
          if (value === 'maintenance') {
            setLinkMaterialRequest(false);
          } else if (value === 'material') {
            setLinkMaterialRequest(true);
          } else if (value === 'none') {
            setLinkMaterialRequest(false);
          }
        }}
        className='flex gap-4'
      >
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='material' id='material' />
          <Label htmlFor='material'>Requisição de Material</Label>
        </div>
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='maintenance' id='maintenance' />
          <Label htmlFor='maintenance'>Requisição de Manutenção</Label>
        </div>
      </RadioGroup> */}

      {/* Formulário para fazer consulta de requisição de manutenção para reserva */}
      {/* {requestSearchType === 'maintenance' && (
        <RequestMaintenanceForm
          // key={formKey}
          setMaintenanceRequestData={setMaintenanceRequestData}
          maintenanceRequestData={maintenanceRequestData}
        />
      )} */}
      {/* Formulário para fazer consulta de requisição de material para reserva */}
      {requestSearchType === 'material' && (
        <RequestMaterialFormBulk
          // key={formKey}
          // setMaintenanceRequestData={setMaintenanceRequestData}
          // maintenanceRequestData={maintenanceRequestData}
          // setMaterialRequestData={setMaterialRequestData}
          // materialRequestData={materialRequestData}
          setDefaultDataMaterialsPickingOrders={
            setDefaultDataMaterialsPickingOrders
          }
          relatedData={relatedData}
        />
      )}

      {/* Renderizar multiplos formularios para reserva em lote */}
      {defaultDataMaterialsPickingOrders &&
        defaultDataMaterialsPickingOrders.map(
          (defaultDataMaterialPickingOrder, index) => {
            const defaultData: Partial<
              Record<keyof IMaterialPickingOrderAddForm, any>
            > & {
              materialRequestBalance: IMaterialRequestBalanceWithRelationsForm[];
            } & {
              linkMaterialRequest: boolean;
            } = {
              warehouseId: warehouse.id,
              desiredPickupDate: startOfDay(new Date()),
              maintenanceRequestId:
                defaultDataMaterialPickingOrder.maintenanceRequestData?.id,
              materialRequestId:
                defaultDataMaterialPickingOrder.materialRequestData?.id,
              beCollectedByUserId: '',
              beCollectedByWorkerId: '',
              collectedByOther: '',
              items:
                defaultDataMaterialPickingOrder.materialRequestBalance?.itemsBalance.map(
                  (
                    item: IItemPickingOrderMaterialRequestForm
                  ): IMaterialPickingOrderItemAddForm => ({
                    key: item.key,
                    globalMaterialId: item.globalMaterialId,
                    materialInstanceId: undefined, // Assuming global material for now
                    quantityToPick: Number(item.quantityBalancePotential),
                    materialRequestItemId: item.materialRequestItemId,
                    unitPrice: item.unitPrice
                  })
                ),
              materialRequestBalance: [],
              notes: undefined,
              collectorType: 'worker',
              legacy_place: undefined,
              requestedByUserId: session?.user.idSisman,
              linkMaterialRequest: true,
              ...defaultDataMaterialPickingOrder.details
            };

            return (
              <div
                className='mb-6 space-y-4 rounded-md border py-4'
                key={
                  formKey +
                  defaultDataMaterialPickingOrder.materialRequestData?.id
                }
              >
                <MaterialPickingOrderFormBulk
                  key={
                    formKey +
                    defaultDataMaterialPickingOrder.materialRequestData?.id
                  }
                  onClean={handleRemoveMaterialPickingOrder.bind(this, index)}
                  onCancel={redirectList}
                  relatedData={relatedData}
                  SubmitButtonIcon={FilePlus}
                  submitButtonText='Realizar Reserva'
                  defaultData={defaultData}
                  defaultDataMaterialPickingOrder={
                    defaultDataMaterialPickingOrder
                  }
                  formActionProp={addMaterialPickingOrder}
                />
              </div>
            );
          }
        )}
    </div>
  );
}
