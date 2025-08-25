'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import * as React from 'react';
import Logger from '@/lib/logger';
import { IMaterialGlobalCatalogWithRelations } from '../../../../global-catalog/material-global-catalog-types';
import {
  IMaterialWithdrawalItemAddFormInfo,
  TableFormItemsGlobal
} from './table-form-items-global';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalItemAddForm
} from '../../withdrawal-types';
import { SearchMaterialByWarehouse } from '../../../components/search-material-global-by-warehouse';

const logger = new Logger(`material-items-field`);

interface MaterialItemsFieldProps {
  field: FieldApi<
    IMaterialWithdrawalAddForm,
    'items',
    IMaterialWithdrawalItemAddForm[],
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
    IMaterialWithdrawalItemAddFormInfo[] | []
  >([]);

  const handleAddMaterial = (
    materialToAdd: IMaterialGlobalCatalogWithRelations | null
  ) => {
    if (!materialToAdd) return; // Guarda contra valores vazios

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
      const quantityWithdrawn = 1; // Default quantity

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

      const materialStateField = {
        key,
        globalMaterialId,
        quantityWithdrawn
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

      // MUDANÇA CRÍTICA: Limpe a busca após adicionar com sucesso.
      // Isso garante que a lista de opções seja resetada, evitando bugs.
      // setSearchQuery('');
    }
  };

  const handleRemoveMaterial = (key: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialWithdrawalItemAddForm) => m.key === key
    );
    if (index !== -1) {
      field.removeValue(index);
    }
  };

  const handleUpdateQuantity = (key: number, quantity: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialWithdrawalItemAddForm) => m.key === key
    );
    if (index !== -1) {
      const updatedMaterial = {
        ...field.state.value[index],
        quantityWithdrawn: quantity
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
          />
        </div>
        {/* <Button type='button' onClick={handleAddMaterial}>
          <Plus className='mr-2 h-4 w-4' />
          Add
        </Button> */}
      </div>
      <TableFormItemsGlobal
        materialsInfo={insertedMaterials}
        materials={field.state.value}
        onRemove={handleRemoveMaterial}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </>
  );
};
