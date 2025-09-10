import { FC, useState, useMemo } from 'react';
import { IMaterialGlobalCatalogWithRelations } from '../global-catalog/material-global-catalog-types';
import { normalizeString } from '@/lib/utils';
import { ResponsiveCombobox } from '@/components/ui/responsive-combobox';
import { useQuery } from '@tanstack/react-query';
import { getMaterialGlobalCatalogs } from '../global-catalog/material-global-catalog-actions';

interface SearchMaterialGlobalProps {
  handleAddMaterial: (
    material: IMaterialGlobalCatalogWithRelations | null
  ) => void;
  excludedFromList?: { materialId?: string | null | undefined }[];
  handleBlurredField?: () => void;
}

export const SearchMaterialGlobal: FC<SearchMaterialGlobalProps> = ({
  handleAddMaterial,
  excludedFromList = [],
  handleBlurredField
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. USE O HOOK useQuery PARA BUSCAR E GERENCIAR OS DADOS
  const {
    data: listGlobalMaterials, // 'data' é renomeado para 'listGlobalMaterialsByWarehouse'
    isLoading: isLoadingGlobal, // Estado de carregamento, gerenciado para você
    isError: isErrorListGlobal, // Estado de erro, gerenciado para você
    error: errorListGlobal // O objeto de erro, se houver
  } = useQuery<IMaterialGlobalCatalogWithRelations[], unknown>({
    // 2. Chave da Query: um array que identifica unicamente esta busca.
    //    Quando 'warehouse.id' mudar, o TanStack Query refaz a busca automaticamente!
    queryKey: ['listGlobalMaterials'],

    // 3. Função da Query: a função assíncrona que retorna os dados.
    queryFn: () => getMaterialGlobalCatalogs(),

    // 4. Habilitar/Desabilitar: A busca só será executada se 'warehouse' existir.
    //    Isso é crucial e muito mais limpo que um 'if' dentro do useEffect.
    // enabled: !!warehouse

    // 5. Roda só no mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false // opcional, evita novas tentativas automáticas
  });

  const materialsMap = useMemo(() => {
    const map = new Map<string, IMaterialGlobalCatalogWithRelations>();
    if (Array.isArray(listGlobalMaterials)) {
      listGlobalMaterials.forEach((material) => {
        map.set(material.id, material);
      });
    }
    return map;
  }, [listGlobalMaterials]);

  const filteredMaterialOptions = useMemo(() => {
    let availableMaterials: IMaterialGlobalCatalogWithRelations[] = [];

    availableMaterials =
      listGlobalMaterials?.filter(
        (material) =>
          !excludedFromList.some(
            (addedMaterial) => addedMaterial.materialId === material.id
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
  }, [listGlobalMaterials, excludedFromList, searchQuery]);

  const selectedMaterialObject = (selectedeMaterialId: string) => {
    const selectedMaterial = materialsMap.get(selectedeMaterialId);

    if (!selectedMaterial) return null;

    return selectedMaterial;
  };

  return (
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
  );
};
