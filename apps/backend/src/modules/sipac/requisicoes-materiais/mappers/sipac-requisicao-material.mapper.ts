import { SipacListaRequisicaoMaterialResponseItem } from '../../sipac-scraping.interfaces';
import { CreateSipacListaRequisicaoMaterialDto } from '../dto/sipac-requisicao-material.dto';

export class SipacListaRequisicaoMaterialMapper {
  static toCreateDto(
    item: SipacListaRequisicaoMaterialResponseItem
  ): CreateSipacListaRequisicaoMaterialDto {
    //Transforma id em inteiro
    const idFormatado = parseInt(item.id.toString(), 10);

    // Transforma o valor monetário de "R$ 1.234,56" para 1234.56
    const valorFormatado = parseFloat(
      item.valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
    );

    // Transforma a data de "DD/MM/YYYY" para um objeto Date
    const [dia, mes, ano] = item.data.split('/').map(Number);
    const dataFormatada = new Date(ano, mes - 1, dia);

    return {
      id: idFormatado,
      numeroDaRequisicao: item.requisicao,
      tipoDaRequisicao: item.tipoDaRequisicao,
      dataDeCadastro: dataFormatada,
      unidadeDeCusto: item.unidadeCusto,
      unidadeRequisitante: item.unidadeRequisitante,
      grupoDeMaterial: item.grupoMaterial,
      almoxarifado: item.almoxarifado,
      statusAtual: item.status,
      usuarioLogin: item.usuario,
      valorDaRequisicao: valorFormatado
    };
  }
}
