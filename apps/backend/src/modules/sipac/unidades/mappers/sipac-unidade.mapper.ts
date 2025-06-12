import { removeAccentsAndSpecialChars } from '../../../../shared/prisma/seeds/seed-utils';
import { SipacUnidadeResponseItem } from '../../sipac-api.interfaces';
import { CreateSipacUnidadeDto } from '../dto/sipac-unidade.dto';

export class SipacUnidadeMapper {
  static toCreateDto(
    responseItem: SipacUnidadeResponseItem
  ): CreateSipacUnidadeDto {
    const reponseFormated = removeAccentsAndSpecialChars(responseItem);

    return {
      id: responseItem['id-unidade'],
      codigoUnidade: responseItem['codigo-unidade'].toString(),
      dataCriacao: new Date(responseItem['data-criacao']),
      nomeUnidade: reponseFormated['nome-unidade'],
      sigla: reponseFormated.sigla
    };
  }
}
