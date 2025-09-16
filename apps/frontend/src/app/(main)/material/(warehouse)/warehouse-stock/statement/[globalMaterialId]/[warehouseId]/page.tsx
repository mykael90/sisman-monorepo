'use client';

import React from 'react';
import { MaterialStatementList } from '../../../_components/list/material-statement-list';

interface MaterialStatementPageProps {
  params: {
    globalMaterialId: string;
    warehouseId: string;
  };
}

export default function MaterialStatementPage({
  params
}: MaterialStatementPageProps) {
  const { globalMaterialId, warehouseId } = params;

  return (
    <MaterialStatementList
      globalMaterialId={globalMaterialId}
      warehouseId={Number(warehouseId)}
    />
  );
}
