'use client';

import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/loading';
import { SectionListHeaderSmall } from '@/components/section-list-header-small';
import { ArrowLeft, LockKeyhole, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { IRestrictionsItemsByWarehouseAndByMaterialId } from '../../restriction-order-types';
import { getMaterialsRestrictedByWarehouseAndMaterial } from '../../restriction-order-actions';

export function MaterialRestrictionListByWarehouseAndMaterial({
  globalMaterial
}: {
  globalMaterial: any;
}) {
  const { warehouse } = useWarehouseContext();
  const router = useRouter();

  const {
    data: restrictionsData,
    isLoading,
    isError,
    error
  } = useQuery<IRestrictionsItemsByWarehouseAndByMaterialId[], Error>({
    queryKey: [
      'materialRestrictionByWarehouseIdAndMaterialId',
      warehouse?.id,
      globalMaterial?.id
    ],
    queryFn: () =>
      getMaterialsRestrictedByWarehouseAndMaterial(
        warehouse?.id as number,
        globalMaterial?.id as string
      ),
    enabled: !!warehouse && !!globalMaterial
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className='text-red-500'>
        Erro ao carregar restrições: {error?.message}
      </div>
    );
  }

  return (
    <div className='container mx-auto'>
      <SectionListHeaderSmall
        title={`Restrições do Material: ${globalMaterial?.name || globalMaterial.id}`}
        subtitle={`Depósito: ${warehouse?.name || warehouse?.id}`}
        TitleIcon={LockKeyhole}
        actionButton={{
          text: 'Voltar',
          // onClick: handleAddWithdrawal,
          onClick: () => router.back(),
          variant: 'outline',
          Icon: ArrowLeft
        }}
      />

      <div className='mt-4'>
        {/* <TableTanstackFaceted
          data={restrictionsData || []}
          columns={columns}
          pagination={pagination}
          setPagination={setPagination}
          getRowClassName={getRowClassName} // Passa a função para estilizar as linhas
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          sorting={sorting}
          setSorting={setSorting}
          getFacetedRowModel={getFacetedRowModel()}
          getFacetedUniqueValues={getFacetedUniqueValues()}
        /> */}
        {JSON.stringify(restrictionsData, null, 2)}
      </div>
    </div>
  );
}
