import { CreateSipacMaterialDto } from '../dto/sipac-material.dto';
import { SipacMaterialResponseItem } from '../../sipac-api.interfaces';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';

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
      consumoEnergia: responseItem['consumo-energia']
        ? new Decimal(responseItem['consumo-energia'])
        : undefined,
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
      precoCompra: responseItem['preco-compra']
        ? new Decimal(responseItem['preco-compra'])
        : undefined,
      valorEstimado: responseItem['valor-estimado']
        ? new Decimal(responseItem['valor-estimado'])
        : undefined
    };
  }
}
