'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MaterialTable } from './material-table';
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

function findMaterialIndexInField(
  material: IMaterialWithdrawalItemAddServiceUsage,
  fieldValue: IMaterialWithdrawalItemAddServiceUsage[]
): number {
  if (!material.globalMaterialId && !material.materialInstanceId) {
    logger.error('globalMaterialId or materialInstanceId are required');
    throw new Error('globalMaterialId or materialInstanceId are required');
  } else {
    logger.info(
      `globalMaterialId: ${material.globalMaterialId}, materialInstanceId: ${material.materialInstanceId}`
    );

    logger.info(JSON.stringify(material, null, 2));

    logger.info(JSON.stringify(fieldValue, null, 2));

    const index = fieldValue.findIndex(
      (m: IMaterialWithdrawalItemAddServiceUsage) => {
        // Se ambos globalMaterialId existirem, compare-os.
        if (material.globalMaterialId && m.globalMaterialId) {
          return m.globalMaterialId === material.globalMaterialId;
        }
        // Se ambos materialInstanceId existirem, compare-os.
        if (material.materialInstanceId && m.materialInstanceId) {
          return m.materialInstanceId === material.materialInstanceId;
        }
        // Caso nenhum dos cenários acima seja verdadeiro, retorne false.
        return false;
      }
    );
    logger.info(`index: ${index}`);
    return index;
  }
}

export const MaterialItemsField: FC<MaterialItemsFieldProps> = ({ field }) => {
  //handleAddMaterial
  const handleAddMaterial = (
    material: IMaterialWithdrawalItemAddServiceUsage
  ) => {
    field.pushValue({ ...material });
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
      <div className='flex gap-2'>
        <Input
          placeholder='Enter the material code or name to add'
          className='flex-1'
        />
        <Button
          type='button'
          onClick={() =>
            handleAddMaterial({
              id: Date.now(),
              materialWithdrawalId: 1,
              name: 'New Material',
              globalMaterialId: '302400026133',
              materialInstanceId: undefined,
              materialRequestItemId: undefined,
              description: 'New Material',
              unitOfMeasure: 'UN',
              quantityWithdrawn: 1,
              stockQty: 100
            })
          }
        >
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
