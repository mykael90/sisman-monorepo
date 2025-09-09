'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import * as React from 'react';
import Logger from '@/lib/logger';
import { IMaterialGlobalCatalogWithRelations } from '../../../../global-catalog/material-global-catalog-types';
import {
  IMaterialReceiptItemAddFormInfo,
  TableFormItemsGlobal
} from './table-form-items-global';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptItemAddForm
} from '../../receipt-types';
import { SearchMaterialByWarehouse } from '../../../components/search-material-global-by-warehouse';

const logger = new Logger(`material-items-field`);

interface MaterialItemsFieldProps {
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
}

export const ItemsFieldArray: FC<MaterialItemsFieldProps> = ({ field }) => {
  const [insertedMaterials, setInsertedMaterials] = React.useState<
    IMaterialReceiptItemAddFormInfo[] | []
  >([]);

  const handleAddMaterial = (
    materialToAdd: IMaterialGlobalCatalogWithRelations | null
  ) => {
    if (!materialToAdd) return;

    if (materialToAdd) {
      console.log(
        `materialToAdd.warehouseStandardStocks ${JSON.stringify(materialToAdd.warehouseStandardStocks, null, 2)}`
      );

      const {
        name,
        description,
        unitOfMeasure,
        id: materialId // Renomeado de globalMaterialId para materialId
      } = materialToAdd;
      const key = Date.now() + Math.random();
      const quantityReceived = 1; // Quantidade padrão para recebimento

      const stockData = materialToAdd.warehouseStandardStocks?.[0];

      let freeBalanceQuantity = null;
      let physicalOnHandQuantity = null;

      if (stockData) {
        if (stockData.freeBalanceQuantity != null)
          freeBalanceQuantity = Number(stockData.freeBalanceQuantity);
        if (stockData.physicalOnHandQuantity != null)
          physicalOnHandQuantity = Number(stockData.physicalOnHandQuantity);
      }

      const unitPrice = stockData?.updatedCost;

      const materialStateField = {
        key,
        materialId, // Usando materialId
        quantityReceived,
        unitPrice
      };

      const materialInfo = {
        key,
        name,
        description,
        unitOfMeasure,
        freeBalanceQuantity,
        physicalOnHandQuantity
      };

      field.pushValue(materialStateField);

      setInsertedMaterials((prevMaterials) => [...prevMaterials, materialInfo]);
    }
  };

  const handleRemoveMaterial = (key: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialReceiptItemAddForm) => m.key === key
    );
    if (index !== -1) {
      field.removeValue(index);
    }
  };

  const handleUpdateQuantity = (key: number, quantity: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialReceiptItemAddForm) => m.key === key
    );
    if (index !== -1) {
      const updatedMaterial = {
        ...field.state.value[index],
        quantityReceived: quantity // Atualizado para quantityReceived
      };
      field.replaceValue(index, updatedMaterial);
    }
  };

  return (
    <>
      <div className='flex gap-4'>
        <div className='flex-1'>
          <SearchMaterialByWarehouse
            handleAddMaterial={handleAddMaterial}
            excludedFromList={field.state.value}
            handleBlurredField={() => field.handleBlur()}
          />
        </div>
      </div>
      {!field.state.meta.isValid && field.state.meta.isBlurred ? (
        <em className='mt-1 block text-xs text-red-500'>
          {field.state.meta.errors
            .map((error: any) => error.message)
            .join('; ')}
        </em>
      ) : null}
      <TableFormItemsGlobal
        materialsInfo={insertedMaterials}
        materials={field.state.value}
        onRemove={handleRemoveMaterial}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </>
  );
};
