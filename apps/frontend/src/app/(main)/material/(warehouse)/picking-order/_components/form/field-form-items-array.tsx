'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import * as React from 'react';
import Logger from '@/lib/logger';
import { IMaterialGlobalCatalogWithRelations } from '../../../../global-catalog/material-global-catalog-types';
import {
  IMaterialPickingOrderItemAddFormInfo,
  TableFormItemsGlobal
} from './table-form-items-global';
import {
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderItemAddForm
} from '../../material-picking-order-types';
import { SearchMaterialByWarehouse } from '../../../components/search-material-global-by-warehouse';
import { toast } from 'sonner';

const logger = new Logger(`material-items-field`);

interface MaterialItemsFieldProps {
  field: FieldApi<
    IMaterialPickingOrderAddForm,
    'items',
    IMaterialPickingOrderItemAddForm[],
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
    IMaterialPickingOrderItemAddFormInfo[] | []
  >([]);

  const handleAddMaterial = (
    materialToAdd: IMaterialGlobalCatalogWithRelations | null
  ) => {
    if (!materialToAdd) return; // Guarda contra valores vazios

    if (
      materialToAdd.warehouseStandardStocks?.length &&
      materialToAdd.warehouseStandardStocks[0].freeBalanceQuantity === '0'
    )
      return toast.error(`Material sem saldo disponível para reservas`);

    if (materialToAdd) {
      console.log(
        `materialToAdd.warehouseStandardStocks ${JSON.stringify(materialToAdd.warehouseStandardStocks, null, 2)}`
      );

      const {
        name,
        description,
        unitOfMeasure,
        id: globalMaterialId
      } = materialToAdd;
      const key = Date.now() + Math.random(); // Temporary ID for table operations
      const quantityToPick = 1; // Default quantity

      // Armazena o valor em uma variável temporária de informações de estoque para legibilidade
      const stockData = materialToAdd.warehouseStandardStocks?.[0];

      let freeBalanceQuantity = null;
      let physicalOnHandQuantity = null;

      if (stockData) {
        if (stockData.freeBalanceQuantity != null)
          freeBalanceQuantity = Number(stockData.freeBalanceQuantity);
        if (stockData.physicalOnHandQuantity != null)
          physicalOnHandQuantity = Number(stockData.physicalOnHandQuantity);
      }

      const unitPrice = stockData?.updatedCost ?? materialToAdd.unitPrice;

      const materialStateField = {
        key,
        globalMaterialId,
        quantityToPick,
        unitPrice
      };

      const materialInfo = {
        key,
        name,
        description,
        unitOfMeasure,
        unitPrice,
        freeBalanceQuantity,
        physicalOnHandQuantity
      };

      field.pushValue(materialStateField);

      setInsertedMaterials((prevMaterials) => [...prevMaterials, materialInfo]);

      // MUDANÇA CRÍTICA: Limpe a busca após adicionar com sucesso.
      // Isso garante que a lista de opções seja resetada, evitando bugs.
      // setSearchQuery('');
    }
  };

  const handleRemoveMaterial = (key: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialPickingOrderItemAddForm) => m.key === key
    );
    if (index !== -1) {
      field.removeValue(index);
    }
  };

  const handleUpdateQuantity = (key: number, quantity: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialPickingOrderItemAddForm) => m.key === key
    );
    if (index !== -1) {
      const updatedMaterial = {
        ...field.state.value[index],
        quantityToPick: quantity
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
        {/* <Button type='button' onClick={handleAddMaterial}>
          <Plus className='mr-2 h-4 w-4' />
          Add
        </Button> */}
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
