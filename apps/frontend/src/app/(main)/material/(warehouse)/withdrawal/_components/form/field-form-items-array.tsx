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
import { normalizeString } from '@/lib/utils'; // Supondo que você tenha essa função

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

  // MUDANÇA 1: Estado para o termo de busca (controlado pelo pai)
  const [searchQuery, setSearchQuery] = React.useState('');

  // MUDANÇA 2: Use `useMemo` para filtrar a lista de materiais.
  // Esta lógica só re-executa quando `listGlobalMaterials` ou `searchQuery` (com debounce) muda.
  const filteredMaterialOptions = React.useMemo(() => {
    // Primeiro, remove os materiais que já foram adicionados
    const availableMaterials =
      listGlobalMaterials?.filter(
        (material) =>
          !field.state.value.some(
            (addedMaterial) => addedMaterial.globalMaterialId === material.id
          )
      ) || [];

    // Se não houver busca, retorna todos os materiais disponíveis
    if (!searchQuery) {
      return availableMaterials.map((material) => ({
        value: material.id,
        label: `(${material.id}) ${material.name}`
      }));
    }

    // Se houver busca, aplica o filtro
    const normalizedSearchTerms = normalizeString(searchQuery)
      .toLowerCase()
      .split(' ')
      .filter(Boolean);

    return availableMaterials
      .filter((material) => {
        const normalizedLabel = normalizeString(
          `(${material.id}) ${material.name}`
        ).toLowerCase();
        return normalizedSearchTerms.every((term) =>
          normalizedLabel.includes(term)
        );
      })
      .map((material) => ({
        value: material.id,
        label: `(${material.id}) ${material.name}`
      }));
  }, [listGlobalMaterials, field.state.value, searchQuery]);

  const handleAddMaterial = (selectedMaterialId: string) => {
    if (!selectedMaterialId) return; // Guarda contra valores vazios

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

        // MUDANÇA CRÍTICA: Limpe a busca após adicionar com sucesso.
        // Isso garante que a lista de opções seja resetada, evitando bugs.
        setSearchQuery('');
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
          {/* MUDANÇA 3: Passa as novas props para o Combobox */}
          <ResponsiveCombobox
            options={filteredMaterialOptions}
            onValueChange={handleAddMaterial}
            searchValue={searchQuery}
            onSearchValueChange={setSearchQuery}
            placeholder='Adicionar material para retirada...'
            emptyMessage='Nenhum material encontrado.'
            className='w-full'
            closeOnSelect={true}
            drawerTitle='Consulta a materiais'
            drawerDescription='Selecione um material para adicionar à retirada.'
            debounce={500}
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
