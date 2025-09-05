import { CreateMaterialDto } from '../dto/material.dto';
import { CreateSipacMaterialDto } from '../../sipac/materiais/dto/sipac-material.dto';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';

export class MaterialsMapper {
  static toCreateDto(item: CreateSipacMaterialDto): CreateMaterialDto {
    return {
      id: String(item.codigo),
      codeSidec: item.codigoSidec,
      name: item.denominacaoMaterial.toUpperCase(),
      description: item.especificacao.toUpperCase(),
      isActive: true,
      unitOfMeasure: item.denominacaoUnidade.toUpperCase(),
      groupId: item.idGrupo,
      unitPrice: new Decimal(item.precoCompra)
    };
  }
}
