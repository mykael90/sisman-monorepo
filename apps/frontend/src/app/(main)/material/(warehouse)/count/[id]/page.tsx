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

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { warehouse } = useWarehouseContext();

  const { data: session, status } = useSession();

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

  console.log('warehouse?.id:', warehouse?.id);
  console.log('params.id:', params);
  console.log('session?.user?.idSisman:', session?.user?.idSisman);
  console.log(
    'Query enabled condition:',
    !!warehouse?.id && !!params.id && !!session?.user?.idSisman
  );

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
    <>
      <div>Hello World!</div>
      <div>{JSON.stringify(warehouse, null, 2)}</div>
      <div>{JSON.stringify(session, null, 2)}</div>
      <div>{JSON.stringify(params, null, 2)}</div>
      <div>{JSON.stringify(materialStock, null, 2)}</div>
      <MaterialCountForm />
    </>
  );
}
