import { CreateMaterialDto, UpdateMaterialDto } from '../dto/material.dto';
import { CreateSipacMaterialDto } from '../../sipac/materiais/dto/sipac-material.dto';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';
import { Prisma } from '@sisman/prisma';

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
      unitPrice: item.precoCompra ? new Decimal(item.precoCompra) : undefined
    };
  }

  static toUpdateDto(item: CreateSipacMaterialDto): UpdateMaterialDto {
    return {
      id: String(item.codigo),
      codeSidec: item.codigoSidec,
      name: item.denominacaoMaterial.toUpperCase(),
      description: item.especificacao.toUpperCase(),
      isActive: true,
      unitOfMeasure: item.denominacaoUnidade.toUpperCase(),
      groupId: item.idGrupo,
      unitPrice: item.precoCompra ? new Decimal(item.precoCompra) : undefined
    };
  }
}
