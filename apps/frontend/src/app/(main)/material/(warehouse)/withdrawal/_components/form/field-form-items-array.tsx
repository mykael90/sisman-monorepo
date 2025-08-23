'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResponsiveCombobox } from '@/components/ui/responsive-combobox';
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
  const [selectedMaterials, setSelectedMaterials] = React.useState<
    IMaterialWithdrawalItemAddFormInfo[] | []
  >([]);

  // const optionsMap = React.useMemo(() => {
  //   const map = new Map<number, IMaterialGlobalCatalogWithRelations>();

  //   if (Array.isArray(listGlobalMaterials)) {
  //     listGlobalMaterials.forEach((material) => {
  //       map.set(Number(material.id), material);
  //     });
  //   }
  //   return map;
  // }, [listGlobalMaterials]);

  //remover da lista os materiais que ja foram adicionados para retirada
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

      // const materialToAdd = optionsMap.get(Number(selectedMaterialId));

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

        setSelectedMaterials((prevMaterials) => [
          ...prevMaterials,
          materialInfo
        ]);
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
      <TableFormItemsGlobal
        materialsInfo={selectedMaterials}
        materials={field.state.value}
        onRemove={handleRemoveMaterial}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </>
  );
};
