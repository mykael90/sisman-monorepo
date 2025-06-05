import { SipacGrupoMaterialResponseItem } from '../../sipac.interfaces';
import { CreateSipacGrupoMaterialDto } from '../dto/sipac-grupo-material.dto';

export class SipacGrupoMaterialMapper {
  static toCreateDto(
    item: SipacGrupoMaterialResponseItem
  ): CreateSipacGrupoMaterialDto {
    return {
      ativo: item.ativo,
      codigo: item.codigo,
      denominacao: item.denominacao,
      descricao: item.descricao,
      idElementoDespesa: item['id-elemento-despesa'],
      idGrupoMaterial: item['id-grupo-material']
    };
  }
}
