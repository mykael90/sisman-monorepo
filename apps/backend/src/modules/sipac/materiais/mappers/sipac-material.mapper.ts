import { CreateSipacMaterialDto } from '@sisman/types';
import { SipacMaterialResponseItem } from '../../sipac-api.interfaces';

export class SipacMaterialMapper {
  static toCreateDto(
    responseItem: SipacMaterialResponseItem
  ): CreateSipacMaterialDto {
    return {
      ativo: responseItem.ativo,
      codigo: String(responseItem.codigo),
      idMaterial: responseItem['id-material'],
      codigoSidec: responseItem['codigo-sidec']
        ? String(responseItem['codigo-sidec'])
        : undefined,
      consumoEnergia: responseItem['consumo-energia'],
      // dataUltimaCompra: new Date(responseItem['data-ultima-compra']),
      denominacaoGrupo: responseItem['denominacao-grupo'],
      denominacaoMaterial: responseItem['denominacao-material'],
      denominacaoMaterialAscii: responseItem['denominacao-material-ascii'],
      denominacaoSubGrupo: responseItem['denominacao-sub-grupo'],
      denominacaoUnidade: responseItem['denominacao-unidade'],
      especificacao: responseItem.especificacao,
      especificacaoAscii: responseItem['especificacao-ascii'],
      idGrupo: responseItem['id-grupo'],
      idSubGrupo: responseItem['id-sub-grupo'],
      precoCompra: responseItem['preco-compra'],
      valorEstimado: responseItem['valor-estimado']
    };
  }
}
