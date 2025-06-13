import { Prisma } from '@sisman/prisma';
import { CreateMaterialDto } from '../dto/material.dto';

export class SipacGrupoMaterialMapper {
  static toCreateDto(
    item: Prisma.SipacMaterialGetPayload<{}>
  ): CreateMaterialDto {
    return {
      id: String(item.idMaterial),
      code: item.codigo,
      codeSidec: item.codigoSidec,
      name: item.denominacaoMaterial.toUpperCase(),
      description: item.especificacao.toUpperCase(),
      isActive: true,
      unitOfMeasure: item.denominacaoUnidade.toUpperCase(),
      groupId: item.idGrupo
    };
  }
}
