'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResponsiveCombobox } from '@/components/ui/responsive-combobox';
import * as React from 'react';
import Logger from '@/lib/logger';
import { IMaterialGlobalCatalogWithRelations } from '../../../../global-catalog/material-global-catalog-types';
import { ItemsGlobalWithdrawalTableFormArray } from './items-global-withdrawal-table-form-array';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalItemAddForm
} from '../../withdrawal-types';

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
  listGlobalMaterials?: IMaterialGlobalCatalogWithRelations[];
}

export const ItemsFieldArray: FC<MaterialItemsFieldProps> = ({
  field,
  listGlobalMaterials
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = React.useState<
    string | undefined
  >(undefined);

  const materialOptions =
    listGlobalMaterials
      ?.filter(
        (material) =>
          !field.state.value.some(
            (addedMaterial) => addedMaterial.globalMaterialId === material.id
          )
      )
      .map((material) => ({
        value: material.id,
        label: `(${material.id}) ${material.name}`
      })) || [];

  const handleAddMaterial = (selectedMaterialId: string) => {
    if (selectedMaterialId) {
      const materialToAdd = listGlobalMaterials?.find(
        (m) => m.id === selectedMaterialId
      );

      if (materialToAdd) {
        console.log(
          `materialToAdd.warehouseStandardStocks ${JSON.stringify(materialToAdd.warehouseStandardStocks, null, 2)}`
        );
        field.pushValue({
          key: Date.now(), // Temporary ID
          // materialWithdrawalId: 1, // Placeholder
          name: materialToAdd.name,
          globalMaterialId: materialToAdd.id,
          materialInstanceId: undefined, // Assuming global material for now
          description: materialToAdd.description,
          unitOfMeasure: materialToAdd.unitOfMeasure,
          quantityWithdrawn: 1, // Default quantity
          freeBalanceQuantity: Number(
            materialToAdd.warehouseStandardStocks?.[0]?.freeBalanceQuantity
          ),
          physicalOnHandQuantity: Number(
            materialToAdd.warehouseStandardStocks?.[0]?.physicalOnHandQuantity
          )
        });
        // setSelectedMaterialId(undefined); // Clear selection after adding
      }
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
          <ResponsiveCombobox
            options={materialOptions}
            // value={selectedMaterialId}
            onValueChange={(value) => {
              // setSelectedMaterialId(value);
              handleAddMaterial(value);
            }}
            placeholder='Adicionar material para retirada...'
            emptyMessage='Nenhum material encontrado.'
            className='w-full'
            closeOnSelect={false} // Added to allow alternative behavior
            drawerTitle='Consulta a materiais'
            drawerDescription='Selecione um material para adicionar à retirada.'
          />
        </div>
        {/* <Button type='button' onClick={handleAddMaterial}>
          <Plus className='mr-2 h-4 w-4' />
          Add
        </Button> */}
      </div>
      <ItemsGlobalWithdrawalTableFormArray
        materials={field.state.value}
        onRemove={handleRemoveMaterial}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </>
  );
};
