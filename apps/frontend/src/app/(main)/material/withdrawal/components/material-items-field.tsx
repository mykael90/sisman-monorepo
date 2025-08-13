'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MaterialTable } from './material-table';
import { Combobox } from '@/components/ui/combobox';
import * as React from 'react';
import {
  IMaterialWithdrawalAddServiceUsage,
  IMaterialWithdrawalItemAddServiceUsage
} from './material-withdrawal-form';
import { IMaterialGlobalCatalog } from '../../material-types';
import Logger from '../../../../../lib/logger';

const logger = new Logger(`material-items-field`);
interface MaterialItemsFieldProps {
  field: FieldApi<
    IMaterialWithdrawalAddServiceUsage,
    'items',
    IMaterialWithdrawalItemAddServiceUsage[],
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
  listGlobalMaterials?: IMaterialGlobalCatalog[];
}

// function findMaterialIndexInField(
//   material: IMaterialWithdrawalItemAddServiceUsage,
//   fieldValue: IMaterialWithdrawalItemAddServiceUsage[]
// ): number {
//   if (!material.globalMaterialId && !material.materialInstanceId) {
//     logger.error('globalMaterialId or materialInstanceId are required');
//     throw new Error('globalMaterialId or materialInstanceId are required');
//   } else {
//     logger.info(
//       `globalMaterialId: ${material.globalMaterialId}, materialInstanceId: ${material.materialInstanceId}`
//     );

//     logger.info(JSON.stringify(material, null, 2));

//     logger.info(JSON.stringify(fieldValue, null, 2));

//     const index = fieldValue.findIndex(
//       (m: IMaterialWithdrawalItemAddServiceUsage) => {
//         // Se ambos globalMaterialId existirem, compare-os.
//         if (material.globalMaterialId && m.globalMaterialId) {
//           return m.globalMaterialId === material.globalMaterialId;
//         }
//         // Se ambos materialInstanceId existirem, compare-os.
//         if (material.materialInstanceId && m.materialInstanceId) {
//           return m.materialInstanceId === material.materialInstanceId;
//         }
//         // Caso nenhum dos cenários acima seja verdadeiro, retorne false.
//         return false;
//       }
//     );
//     logger.info(`index: ${index}`);
//     return index;
//   }
// }

export const MaterialItemsField: FC<MaterialItemsFieldProps> = ({
  field,
  listGlobalMaterials
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = React.useState<
    string | undefined
  >(undefined);

  const materialOptions =
    listGlobalMaterials?.map((material) => ({
      value: material.id,
      label: `${material.codeSidec} - ${material.name}`
    })) || [];

  const handleAddMaterial = () => {
    if (selectedMaterialId) {
      const materialToAdd = listGlobalMaterials?.find(
        (m) => m.id === selectedMaterialId
      );
      if (materialToAdd) {
        field.pushValue({
          id: Date.now(), // Temporary ID
          materialWithdrawalId: 1, // Placeholder
          name: materialToAdd.name,
          globalMaterialId: materialToAdd.id,
          materialInstanceId: undefined, // Assuming global material for now
          description: materialToAdd.description,
          unitOfMeasure: materialToAdd.unitOfMeasure,
          quantityWithdrawn: 1, // Default quantity
          stockQty: 0 // Default stockQty as it's not in IMaterialGlobalCatalog
        });
        setSelectedMaterialId(undefined); // Clear selection after adding
      }
    }
  };

  const handleRemoveMaterial = (id: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialWithdrawalItemAddServiceUsage) => m.id === id
    );
    if (index !== -1) {
      field.removeValue(index);
    }
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    const index = field.state.value.findIndex(
      (m: IMaterialWithdrawalItemAddServiceUsage) => m.id === id
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
          <Combobox
            options={materialOptions}
            value={selectedMaterialId}
            onValueChange={setSelectedMaterialId}
            placeholder='Select material...'
            emptyMessage='No materials found.'
            className='w-full'
          />
        </div>
        <Button type='button' onClick={handleAddMaterial}>
          <Plus className='mr-2 h-4 w-4' />
          Add
        </Button>
      </div>
      <MaterialTable
        materials={field.state.value}
        onRemove={handleRemoveMaterial}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </>
  );
};
