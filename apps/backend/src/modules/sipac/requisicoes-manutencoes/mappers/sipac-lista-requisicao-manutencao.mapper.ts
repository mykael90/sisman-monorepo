import { SipacListaRequisicaoManutencaoResponseItem } from '../../sipac-scraping.interfaces';
import { CreateSipacListaRequisicaoManutencaoDto } from '../dto/sipac-requisicao-manutencao.dto';

export class SipacListaRequisicaoManutencaoMapper {
  static toCreateDto(
    item: SipacListaRequisicaoManutencaoResponseItem
  ): CreateSipacListaRequisicaoManutencaoDto {
    // Assuming the structure of SipacListaRequisicaoManutencaoResponseItem
    // is similar to the nested 'detalhesAninhados' in the provided example
    // and maps directly to CreateSipacListaRequisicaoManutencaoDto.
    // Need to confirm the actual list response structure from the API.
    // For now, mapping based on the provided example's 'dadosDaRequisicao.detalhesAninhados'
    // which seems to represent a single item in a list view.

    // TODO: Confirm the actual structure of the list API response for maintenance requisitions.
    // The current mapping is based on the assumption that the list item
    // contains fields similar to the nested 'detalhesAninhados' in the single item response.

    return {
      id: item.id, // Assuming 'id' is present in the list item response
      numeroRequisicao: item.requisicao,
      tipoDaRequisicao: item.tipoDaRequisicao,
      divisao: item.divisao,
      usuarioGravacao: item.requisicaoGravadaPeloUsuario,
      status: item.status,
      dataDeCadastro: new Date(item.dataDeCadastro), // Assuming date format is parseable by Date constructor
      unidadeRequisitante: item.unidadeRequisitante,
      unidadeDeCusto: item.unidadeDeCusto,
      descricao: item.descricao,
      local: item.local,
      representanteDaUnidadeDeOrigem: item.representanteDaUnidadeDeOrigem,
      telefonesDoRepresentante: item.telefonesDoRepresentante,
      ramal: item.ramal,
      email: item.email,
      horarioParaAtendimento: item.horarioParaAtendimento,
      observacao: item.observacao
    };
  }
}
