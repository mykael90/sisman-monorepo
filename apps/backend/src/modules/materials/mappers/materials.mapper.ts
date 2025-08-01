import { SipacMaterial } from '@sisman/prisma';
import { CreateMaterialDto } from '@sisman/types';

export class MaterialsMapper {
  static toCreateDto(item: SipacMaterial): CreateMaterialDto {
    return {
      id: String(item.codigo),
      codeSidec: item.codigoSidec,
      name: item.denominacaoMaterial.toUpperCase(),
      description: item.especificacao.toUpperCase(),
      isActive: true,
      unitOfMeasure: item.denominacaoUnidade.toUpperCase(),
      groupId: item.idGrupo
    };
  }
}
