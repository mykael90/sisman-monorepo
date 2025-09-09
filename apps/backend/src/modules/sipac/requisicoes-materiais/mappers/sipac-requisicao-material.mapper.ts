import {
  SipacDetalheAquisicaoItemMaterial,
  SipacHistoricoDaRequisicaoMaterial,
  SipacItemDaRequisicaoMaterial,
  SipacListaRequisicaoMaterialResponseItem,
  SipacRequisicaoMaterialResponseItem,
  SipacTotalizacaoElementoDespesaMaterial
} from '../../sipac-scraping.interfaces';
import { Prisma } from '@sisman/prisma';
import {
  CreateSipacListaRequisicaoMaterialDto,
  UpdateSipacRequisicaoMaterialDto,
  CreateSipacItemRequisicaoMaterialDto,
  CreateSipacHistoricoRequisicaoMaterialDto,
  CreateSipacTotalizacaoElementoDespesaMaterialDto,
  CreateSipacDetalheAquisicaoItemMaterialDto
} from '../dto/sipac-requisicao-material.dto';

export class SipacListaRequisicaoMaterialMapper {
  // Helper to parse date string (DD/MM/YYYY) to Date or undefined
  static parseDateString(value: string | undefined | null): Date | undefined {
    if (value === null || value === undefined || String(value).trim() === '') {
      return undefined;
    }
    const parts = String(value).split('/');
    if (parts.length !== 3) return undefined;

    const [dia, mes, ano] = parts.map(Number);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return undefined;

    const date = new Date(ano, mes - 1, dia);
    return isNaN(date.getTime()) ? undefined : date;
  }

  static toCreateDto(
    item: SipacListaRequisicaoMaterialResponseItem
  ): CreateSipacListaRequisicaoMaterialDto {
    //Transforma id em inteiro
    const idFormatado = parseInt(item.id.toString(), 10);
    const valorFormatado = SipacRequisicaoMaterialMapper.parseDecimal(
      item.valor
    ) as Prisma.Decimal; // Reutilizando o helper da outra classe

    return {
      id: idFormatado,
      numeroDaRequisicao: item.requisicao,
      tipoDaRequisicao: item.tipoDaRequisicao,
      dataDeCadastro: this.parseDateString(item.data) as Date,
      siglaUnidadeDeCusto: item.unidadeCusto,
      siglaUnidadeRequisitante: item.unidadeRequisitante,
      grupoDeMaterial: item.grupoMaterial,
      almoxarifado: item.almoxarifado,
      statusAtual: item.status,
      usuarioLogin: item.usuario,
      valorDaRequisicao: valorFormatado,
      grupoMaterialId: undefined
    };
  }
}

export class SipacRequisicaoMaterialMapper {
  // Helper to parse string to Prisma.Decimal or undefined
  static parseDecimal(
    // Tornando público para ser acessível por SipacListaRequisicaoMaterialMapper
    value: string | undefined | null
  ): Prisma.Decimal | undefined {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === '' ||
      String(value).toLowerCase() === 'null'
    ) {
      return undefined;
    }
    const cleanedValue = String(value)
      .replace('R$', '')
      .replace(/\.(?=.*\.)/g, '') // Remove thousands separators if present (e.g., 1.234,56)
      .replace(',', '.') // Replace decimal comma with dot
      .trim();
    const num = parseFloat(cleanedValue);
    return isNaN(num) ? undefined : (num as unknown as Prisma.Decimal);
  }

  // Helper to parse date string (ISO 8601 or other common formats) to Date or undefined
  private static parseDate(value: string | undefined | null): Date | undefined {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === '' ||
      String(value).toLowerCase() === 'null'
    ) {
      return undefined;
    }
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? undefined : date;
  }

  // Helper to parse date-time string (DD/MM/YYYY HH:mm) to Date or undefined
  private static parseDateHour(
    value: string | undefined | null
  ): Date | undefined {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === '' ||
      String(value).toLowerCase() === 'null'
    ) {
      return undefined;
    }
    const parts = String(value).match(
      /(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})/
    );
    if (!parts) return undefined;
    // parts[1]=DD, parts[2]=MM, parts[3]=YYYY, parts[4]=HH, parts[5]=mm
    const date = new Date(
      +parts[3],
      +parts[2] - 1,
      +parts[1],
      +parts[4],
      +parts[5]
    );
    return isNaN(date.getTime()) ? undefined : date;
  }
  // Helper to parse "numero/ano" from a string like "1164/ 2025 (REQUISIÇÃO DE MANUTENÇÃO)"
  private static parseNumeroAnoRelacionado(
    value: string | undefined | null
  ): string | undefined {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === '' ||
      String(value).toLowerCase() === 'null'
    ) {
      return undefined;
    }
    const match = String(value).match(/(\d+\/\s*\d+)/);
    // If match is found, return the first captured group (numero/ano) with spaces removed
    return match && match[1] ? match[1].replace(/\s+/g, '') : undefined;
  }

  static toUpdateDto(
    item: SipacRequisicaoMaterialResponseItem
  ): UpdateSipacRequisicaoMaterialDto {
    const dados = item.dadosDaRequisicao;

    // Note: 'id' (SIPAC ID of the requisition) is not present in SipacRequisicaoMaterialResponseItem.
    // 'almoxarifado' is also not in item.dadosDaRequisicao.
    // 'requisicaoId' for nested DTOs will be undefined as it depends on the parent's SIPAC ID.

    return {
      // id: undefined, // Not available in SipacRequisicaoMaterialResponseItem
      numeroDaRequisicao: dados.numeroDaRequisicao,
      tipoDaRequisicao: dados.tipo, // Mapping 'tipo' to 'tipoDaRequisicao'
      convenio: dados.convenio,
      // grupoDeMaterial: dados.grupoDeMaterial,
      // unidadeDeCusto: dados.unidadeDeCusto,
      // unidadeRequisitante: dados.unidadeRequisitante,
      destinoDaRequisicao: dados.destinoDaRequisicao,
      // usuarioLogin: dados.usuario, // Mapping 'usuario' to 'usuarioLogin'
      dataDeCadastro: SipacListaRequisicaoMaterialMapper.parseDateString(
        dados.dataDeCadastro
      ),
      dataDeEnvio: SipacListaRequisicaoMaterialMapper.parseDateString(
        dados.dataDeEnvio
      ),
      valorDaRequisicao: this.parseDecimal(dados.valorDaRequisicao),
      valorDoTotalAtendido: this.parseDecimal(dados.valorDoTotalAtendido),
      opcaoOrcamentaria: dados.opcaoOrcamentaria,
      numeroDaRequisicaoRelacionada: this.parseNumeroAnoRelacionado(
        dados.numeroDaRequisicaoRelacionada
      ),
      local: dados.local,
      observacoes: dados.observacoes,
      statusAtual: dados.statusAtual,
      // almoxarifado: undefined, // Not available in item.dadosDaRequisicao
      grupoMaterialId: undefined, // Not available in item.dadosDaRequisicao
      itensDaRequisicao: dados.itensDaRequisicao?.map(
        (
          subItem: SipacItemDaRequisicaoMaterial
        ): CreateSipacItemRequisicaoMaterialDto =>
          ({
            // requisicaoId: undefined, // Parent SIPAC ID not available from item
            numeroItem: parseInt(subItem.numeroitem, 10),
            codigo: subItem.codigo,
            quantidade: this.parseDecimal(subItem.qt),
            valor: this.parseDecimal(subItem.valor) as Prisma.Decimal, // Cast, assuming valid if present
            total: this.parseDecimal(subItem.total) as Prisma.Decimal, // Cast, assuming valid if present
            quantidadeAtendida: this.parseDecimal(subItem.quantidadeatendida),
            quantidadeDevolvida: this.parseDecimal(subItem.quantidadedevolvida),
            quantidadeEmCompra: this.parseDecimal(subItem.quantidadeemcompra),
            valorAtendimento: this.parseDecimal(subItem.valoratendimento),
            totalAtendimento: this.parseDecimal(subItem.totalatendimento),
            status: subItem.status,
            denominacao: subItem.denominacao
          }) as CreateSipacItemRequisicaoMaterialDto // Type assertion due to missing requisicaoId
      ),

      historicoDaRequisicao: dados.historicoDaRequisicao?.map(
        (
          histItem: SipacHistoricoDaRequisicaoMaterial
        ): CreateSipacHistoricoRequisicaoMaterialDto =>
          ({
            // requisicaoId: undefined, // Parent SIPAC ID not available from item
            dataHora: this.parseDateHour(histItem.datahora) as Date, // Cast, assuming valid if present
            status: histItem.status,
            usuario: histItem.usuario,
            observacoes: histItem.observacoes
          }) as CreateSipacHistoricoRequisicaoMaterialDto // Type assertion
      ),

      totalizacaoPorElementoDeDespesasDetalhados:
        item.totalizacaoPorElementosDeDespesasDetalhados?.map(
          (
            totItem: SipacTotalizacaoElementoDespesaMaterial
          ): CreateSipacTotalizacaoElementoDespesaMaterialDto =>
            ({
              // requisicaoId: undefined, // Parent SIPAC ID not available from item
              grupoDeMaterial: totItem.grupoDeMaterial,
              total: this.parseDecimal(totItem.total) as Prisma.Decimal // Cast, assuming valid if present
            }) as CreateSipacTotalizacaoElementoDespesaMaterialDto // Type assertion
        ),

      detalhesDaAquisicao: item.detalhesDaAquisicaoDosItens?.map(
        (
          detItem: SipacDetalheAquisicaoItemMaterial
        ): CreateSipacDetalheAquisicaoItemMaterialDto =>
          ({
            // requisicaoId: undefined, // Parent SIPAC ID not available from item
            compras: detItem.compras,
            empenhos: detItem.empenhos,
            notasFiscais: detItem.notasFiscais,
            processosDePagamento: detItem.processosDePagamento
          }) as CreateSipacDetalheAquisicaoItemMaterialDto // Type assertion
      )
    };
  }
}
