'use client';

import { useParams } from 'next/navigation';
import { useWarehouseContext } from '../../../choose-warehouse/context/warehouse-provider';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import MaterialCountForm from '../_components/form/material-count-form';
import { useQuery } from '@tanstack/react-query';
import { IWarehouseStockWithRelations } from '../../warehouse-stock/warehouse-stock-types';
import { showWarehouseStock } from '../../warehouse-stock/warehouse-stock-actions';
import Loading from '../../../../../../components/loading';
import {
  IStockMovementCountAdd,
  IStockMovementWithRelations
} from '../../stock-movement/stock-movement-types';
import { IActionResultForm } from '../../../../../../types/types-server-actions';
import { useState } from 'react';
import { addStockMovementCount } from '../../stock-movement/stock-movement-actions';
import { Calculator } from 'lucide-react';
import FormAddHeader from '../../../../../../components/form-tanstack/form-add-header';
import { CardMaterialStockSummary } from './_components/card-material-stock-summary';
import { materialCountFormSchemaAdd } from '../_components/form/material-count-form-validation';

export default function MaterialCountPage({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { warehouse } = useWarehouseContext();

  const { data: session, status } = useSession();
  const [formKey, setFormKey] = useState(() => Date.now().toString());

  const {
    data: materialStock,
    isLoading,
    isError,
    error
  } = useQuery<IWarehouseStockWithRelations, Error>({
    queryKey: [
      'materialStock',
      warehouse?.id,
      params.id,
      session?.user?.idSisman
    ],
    queryFn: () => showWarehouseStock(Number(params.id)),
    enabled: !!warehouse?.id && !!params.id && !!session?.user?.idSisman
  });

  if (status !== 'loading' && !session?.user?.idSisman) {
    toast.warning('É preciso está autenticado para acessar essa página.');
    router.push('/signin');
  }

  // A verificação `!userId` também protege contra o valor `NaN`.
  if (!warehouse?.id) {
    return <p>Acesso negado. Por favor, selecione um almoxarifado.</p>;
  }

  if (!materialStock?.materialId) {
    return <p>Material não encontrado.</p>;
  }

  if (!session?.user?.idSisman) {
    return <p>Acesso negado. Usuário não autenticado.</p>;
  }

  const defaultData: IStockMovementCountAdd = {
    quantity: '',
    globalMaterialId: materialStock?.materialId,
    warehouseId: warehouse?.id,
    processedByUserId: session?.user?.idSisman
  };

  const fieldLabels: Record<keyof IStockMovementCountAdd, string> = {
    quantity: 'Contagem',
    globalMaterialId: 'Material',
    warehouseId: 'Almoxarifado',
    processedByUserId: 'Usuário'
  };

  const initialServerState: IActionResultForm<
    IStockMovementCountAdd,
    IStockMovementWithRelations
  > = {
    errorsServer: [],
    message: ''
  };

  const redirect = () => {
    router.push('/material/warehouse-stock');
  };

  const triggerFormReset = () => setFormKey(Date.now().toString());

  // console.log('warehouse?.id:', warehouse?.id);
  // console.log('params.id:', params);
  // console.log('session?.user?.idSisman:', session?.user?.idSisman);
  // console.log(
  //   'Query enabled condition:',
  //   !!warehouse?.id && !!params.id && !!session?.user?.idSisman
  // );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className='text-red-500'>
        Erro ao carregar extrato: {error?.message}
      </div>
    );
  }

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      {/* Header */}
      <FormAddHeader
        Icon={Calculator}
        title='Realizar Contagem de Material'
        subtitle='Adicionar uma nova contagem ao sistema'
      ></FormAddHeader>

      {/* Create a card summary for informations of material */}

      <div className='p-4'>
        <CardMaterialStockSummary materialStock={materialStock} />
      </div>

      <MaterialCountForm
        key={formKey}
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={addStockMovementCount}
        formSchema={materialCountFormSchemaAdd}
        SubmitButtonIcon={Calculator}
        submitButtonText='Inserir Contagem'
        relatedData={{
          materialStock
        }}
        isInDialog={isInDialog}
      />
    </div>
  );
}
