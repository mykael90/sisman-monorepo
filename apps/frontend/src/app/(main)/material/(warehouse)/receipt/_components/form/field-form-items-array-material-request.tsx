'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import * as React from 'react';
import Logger from '@/lib/logger';
import { TableFormItemsGlobal } from './table-form-items-global';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptItemAddForm
} from '../../receipt-types';
import {
  IMaterialReceiptItemAddFormInfo,
  TableFormItemsMaterialRequest
} from './table-form-items-material-request';

const logger = new Logger(`material-items-field`);

interface MaterialItemsMaterialRequestFieldProps {
  field: FieldApi<
    IMaterialReceiptAddForm,
    'items',
    IMaterialReceiptItemAddForm[],
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  materialInfo: IMaterialReceiptItemAddFormInfo[];
}

export const ItemsFieldArrayMaterialRequest: FC<
  MaterialItemsMaterialRequestFieldProps
> = ({ field, materialInfo }) => {
  const handleRemoveMaterial = (key: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialReceiptItemAddForm) => m.key === key
    );
    if (index !== -1) {
      field.removeValue(index);
    }
  };

  const handleUpdateItemQuantity = (
    key: number,
    quantity: number,
    type: 'quantityReceived' | 'quantityRejected'
  ) => {
    const index = field.state.value.findIndex(
      (m: IMaterialReceiptItemAddForm) => m.key === key
    );
    if (index !== -1) {
      const updatedMaterial = {
        ...field.state.value[index],
        [type]: quantity
      };
      field.replaceValue(index, updatedMaterial);
    }
  };

  return (
    <>
      <div className='flex gap-4'></div>
      <TableFormItemsMaterialRequest
        materialsInfo={materialInfo}
        materials={field.state.value}
        onRemove={handleRemoveMaterial}
        onUpdateItemQuantity={handleUpdateItemQuantity}
      />
    </>
  );
};
