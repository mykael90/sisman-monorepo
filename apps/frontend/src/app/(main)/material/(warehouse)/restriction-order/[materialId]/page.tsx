import React from 'react';
import { showMaterialGlobalCatalog } from '../../../global-catalog/material-global-catalog-actions';
import { MaterialRestrictionListByWarehouseAndMaterial } from './_components/material-restriction-list';

export default async function Page({
  params
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;

  const material = await showMaterialGlobalCatalog(materialId);

  return (
    <MaterialRestrictionListByWarehouseAndMaterial globalMaterial={material} />
  );
}
