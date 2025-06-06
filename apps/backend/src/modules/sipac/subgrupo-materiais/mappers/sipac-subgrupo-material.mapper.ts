import { SipacSubGrupoMaterialResponseItem } from '../../sipac-api.interfaces';
import { CreateSipacSubGrupoMaterialDto } from '../dto/sipac-subgrupo-material.dto';

export class SipacSubGrupoMaterialMapper {
  static toCreateDto(
    item: SipacSubGrupoMaterialResponseItem
  ): CreateSipacSubGrupoMaterialDto {
    return {
      codigo: item.codigo,
      denominacao: item.denominacao,
      idGrupoMaterial: item['id-grupo-material'],
      idSubGrupoMaterial: item['id-sub-grupo-material']
    };
  }
}
