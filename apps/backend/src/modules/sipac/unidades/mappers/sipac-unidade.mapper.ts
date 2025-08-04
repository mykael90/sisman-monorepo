import { normalizeString } from '../../../../shared/utils/string-utils';
import { SipacUnidadeResponseItem } from '../../sipac-api.interfaces';
import { CreateSipacUnidadeDto } from '@sisman/types/backend';

export class SipacUnidadeMapper {
  static toCreateDto(
    responseItem: SipacUnidadeResponseItem
  ): CreateSipacUnidadeDto {
    return {
      id: responseItem['id-unidade'],
      codigoUnidade: responseItem['codigo-unidade'].toString(),
      nomeUnidade: normalizeString(responseItem['nome-unidade']),
      sigla: responseItem.sigla
    };
  }
}
