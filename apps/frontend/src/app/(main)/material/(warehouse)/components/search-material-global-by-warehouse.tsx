import { FC, useState, useMemo } from 'react';
import { IMaterialGlobalCatalogWithRelations } from '../../global-catalog/material-global-catalog-types';
import { normalizeString } from '@/lib/utils';
import { ResponsiveCombobox } from '@/components/ui/responsive-combobox';
import { useQuery } from '@tanstack/react-query';
import { useWarehouseContext } from '../../choose-warehouse/context/warehouse-provider';
import { getMaterialGlobalCatalogsByWarehouse } from '../../global-catalog/material-global-catalog-actions';

interface SearchMaterialGlobalByWarehouseProps {
  handleAddMaterial: (
    material: IMaterialGlobalCatalogWithRelations | null
  ) => void;
  excludedFromList?: { globalMaterialId?: string | null | undefined }[];
  handleBlurredField?: () => void;
}

export const SearchMaterialByWarehouse: FC<
  SearchMaterialGlobalByWarehouseProps
> = ({ handleAddMaterial, excludedFromList = [], handleBlurredField }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [listToUse, setListToUse] = useState<
    IMaterialGlobalCatalogWithRelations[]
  >([]);

  const { warehouse } = useWarehouseContext();

  // 1. USE O HOOK useQuery PARA BUSCAR E GERENCIAR OS DADOS
  const {
    data: listGlobalMaterialsByWarehouse, // 'data' é renomeado para 'listGlobalMaterialsByWarehouse'
    isLoading, // Estado de carregamento, gerenciado para você
    isError, // Estado de erro, gerenciado para você
    error // O objeto de erro, se houver
  } = useQuery({
    // 2. Chave da Query: um array que identifica unicamente esta busca.
    //    Quando 'warehouse.id' mudar, o TanStack Query refaz a busca automaticamente!
    queryKey: ['listGlobalMaterialsByWarehouse', warehouse?.id],

    // 3. Função da Query: a função assíncrona que retorna os dados.
    queryFn: () =>
      getMaterialGlobalCatalogsByWarehouse(warehouse?.id as number),

    // 4. Habilitar/Desabilitar: A busca só será executada se 'warehouse' existir.
    //    Isso é crucial e muito mais limpo que um 'if' dentro do useEffect.
    enabled: !!warehouse
  });

  //filtar os materiais que já tenham sido movimentados no depósito
  const listGlobalMaterialsByWarehouseWithWarehouseIncluded = useMemo(() => {
    if (!listGlobalMaterialsByWarehouse) return [];

    return listGlobalMaterialsByWarehouse.filter(
      (material) =>
        material.warehouseStandardStocks?.length &&
        material.warehouseStandardStocks?.length > 0
    );
  }, [listGlobalMaterialsByWarehouse]);

  const materialsMap = useMemo(() => {
    const map = new Map<string, IMaterialGlobalCatalogWithRelations>();
    if (Array.isArray(listGlobalMaterialsByWarehouse)) {
      listGlobalMaterialsByWarehouse.forEach((material) => {
        map.set(material.id, material);
      });
    }
    return map;
  }, [listGlobalMaterialsByWarehouse]);

  const filteredMaterialOptions = useMemo(() => {
    const availableMaterials =
      listGlobalMaterialsByWarehouse?.filter(
        (material) =>
          !excludedFromList.some(
            (addedMaterial) => addedMaterial.globalMaterialId === material.id
          )
      ) || [];

    if (!searchQuery) {
      return availableMaterials.map((material) => ({
        value: material.id,
        label: `(${material.id}) ${material.name}`
      }));
    }

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
  }, [listGlobalMaterialsByWarehouse, excludedFromList, searchQuery]);

  const selectedMaterialObject = (selectedeMaterialId: string) => {
    const selectedMaterial = materialsMap.get(selectedeMaterialId);

    if (!selectedMaterial) return null;

    return selectedMaterial;
  };

  return (
    <>
      {isLoading ? (
        'Carregando...'
      ) : (
        <div onClick={handleBlurredField}>
          {/* {JSON.stringify(listGlobalMaterialsByWarehouse, null, 2)} */}
          <ResponsiveCombobox
            options={filteredMaterialOptions}
            onValueChange={(value) =>
              handleAddMaterial(selectedMaterialObject(value))
            }
            searchValue={searchQuery}
            onSearchValueChange={setSearchQuery}
            placeholder='Adicionar material para retirada...'
            emptyMessage='Nenhum material encontrado.'
            className='w-full'
            closeOnSelect={false}
            drawerTitle='Consulta a materiais'
            drawerDescription='Selecione um material para adicionar à retirada.'
            debounce={500}
          />
        </div>
      )}
    </>
  );
};
