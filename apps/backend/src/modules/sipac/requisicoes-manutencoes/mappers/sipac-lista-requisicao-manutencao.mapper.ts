import { SipacListaRequisicaoManutencaoResponseItem } from '../../sipac-scraping.interfaces';
import { CreateSipacListaRequisicaoManutencaoDto } from '../dto/sipac-requisicao-manutencao.dto';

export class SipacListaRequisicaoManutencaoMapper {
  static toCreateDto(
    item: SipacListaRequisicaoManutencaoResponseItem
  ): CreateSipacListaRequisicaoManutencaoDto {
    //Transforma id em inteiro
    const idFormatado = parseInt(item.id.toString(), 10);

    return {
      id: idFormatado,
      numeroRequisicao: item.numeroAno,
      tipoDaRequisicao: item.tipo,
      descricao: item.descricao,
      local: item.local,
      status: item.status,
      usuarioGravacao: item.usuario
    };
  }
}
