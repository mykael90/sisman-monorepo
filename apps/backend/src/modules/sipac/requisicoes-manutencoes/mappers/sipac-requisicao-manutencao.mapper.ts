import { toPlainObject } from 'lodash';
import {
  SipacRequisicaoManutencaoResponseItem,
  SipacInformacoesDoServicoManutencaoResponse,
  SipacRequisicaoManutencaoAssociadaResponse,
  SipacRequisicaoMaterialAssociadaManutencaoResponse,
  SipacImovelPredioManutencaoResponse,
  SipacHistoricoManutencaoResponse,
  SipacItemRequisicaoMaterialManutencaoResponse,
  SipacListaRequisicaoManutencaoResponseItem
} from '../../sipac-scraping.interfaces';
import {
  CreateSipacRequisicaoManutencaoCompletoDto,
  SipacDadosDaRequisicaoManutencaoDto,
  SipacInformacoesDoServicoManutencaoDto,
  SipacRequisicaoManutencaoAssociadaDto,
  SipacRequisicaoMaterialAssociadaManutencaoDto,
  SipacImovelPredioManutencaoDto,
  SipacHistoricoManutencaoDto,
  SipacItemRequisicaoMaterialManutencaoDto,
  CreateSipacListaRequisicaoManutencaoDto
} from '../dto/sipac-requisicao-manutencao.dto';
import { DecimalJsLike } from '@sisman/prisma/generated/client/runtime/library';

export class SipacRequisicaoManutencaoMapper {
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
    item: SipacRequisicaoManutencaoResponseItem
  ): CreateSipacRequisicaoManutencaoCompletoDto {
    const dadosDaRequisicao = item.dadosDaRequisicao.detalhesAninhados;

    return {
      dadosDaRequisicao: {
        requisicao: dadosDaRequisicao.requisicao,
        tipoDaRequisicao: dadosDaRequisicao.tipoDaRequisicao,
        divisao: dadosDaRequisicao.divisao,
        requisicaoGravadaPeloUsuario:
          dadosDaRequisicao.requisicaoGravadaPeloUsuario,
        status: dadosDaRequisicao.status,
        dataDeCadastro: SipacRequisicaoManutencaoMapper.parseDateString(
          dadosDaRequisicao.dataDeCadastro
        ), // Assuming date format is parseable
        unidadeRequisitante: dadosDaRequisicao.unidadeRequisitante,
        unidadeDeCusto: dadosDaRequisicao.unidadeDeCusto,
        descricao: dadosDaRequisicao.descricao,
        local: dadosDaRequisicao.local,
        representanteDaUnidadeDeOrigem:
          dadosDaRequisicao.representanteDaUnidadeDeOrigem,
        telefonesDoRepresentante: dadosDaRequisicao.telefonesDoRepresentante,
        ramal: dadosDaRequisicao.ramal,
        email: dadosDaRequisicao.email,
        horarioParaAtendimento: dadosDaRequisicao.horarioParaAtendimento,
        observacao: dadosDaRequisicao.observacao
      },
      informacoesDoServico: item.informacoesDoServico?.map(
        SipacRequisicaoManutencaoMapper.toInformacoesDoServicoDto
      ),
      requisicoesDeManutencaoAssociadas:
        item.requisicoesDeManutencaoAssociadas?.map(
          SipacRequisicaoManutencaoMapper.toRequisicaoManutencaoAssociadaDto
        ),
      requisicoesMateriais: item.requisicoesAssociadasDeMateriais?.map(
        SipacRequisicaoManutencaoMapper.toRequisicaoMaterialAssociadaManutencaoDto
      ),
      predios: item['imoveis/prediosInseridos']?.map(
        SipacRequisicaoManutencaoMapper.toImovelPredioManutencaoDto
      ),
      historico: item.historico.map(
        SipacRequisicaoManutencaoMapper?.toHistoricoManutencaoDto
      )
    };
  }

  static toInformacoesDoServicoDto(
    item: SipacInformacoesDoServicoManutencaoResponse
  ): SipacInformacoesDoServicoManutencaoDto {
    return {
      // requisicaoManutencaoId will be set by the service when creating nested records
      diagnostico: item.diagnostico,
      executante: item.executante,
      dataDeCadastro: SipacRequisicaoManutencaoMapper.parseDateString(
        item.dataDeCadastro
      ),
      tecnicoResponsavel: item.tecnicoResponsavel
    };
  }

  static toRequisicaoManutencaoAssociadaDto(
    item: SipacRequisicaoManutencaoAssociadaResponse
  ): SipacRequisicaoManutencaoAssociadaDto {
    return {
      numeroAno: item['numero/ano'],
      descricao: item.descricao,
      status: item.status,
      dataDeCadastro: SipacRequisicaoManutencaoMapper.parseDateString(
        item.dataDeCadastro
      ),
      usuario: item.usuario,
      id: parseInt(item.id, 10)
    };
  }

  static toRequisicaoMaterialAssociadaManutencaoDto(
    item: SipacRequisicaoMaterialAssociadaManutencaoResponse
  ): SipacRequisicaoMaterialAssociadaManutencaoDto {
    return {
      // sipacRequisicaoManutencaoId will be set by the service
      id: parseInt(item.id, 10),
      numeroDaRequisicao: item.requisicao,
      grupoDeMaterial: item.grupo,
      dataDeCadastro: SipacRequisicaoManutencaoMapper.parseDateString(
        item.dataCadastro
      ),
      statusAtual: item.status,
      itens: item.itens.map(
        SipacRequisicaoManutencaoMapper.toItemRequisicaoMaterialManutencaoDto
      ),
      totalGrupoQuantidade: item.totalGrupoQuantidade,
      totalGrupoValorCalculado: item.totalGrupoValorCalculado
        .replace('R$', '')
        .trim()
        .replace(',', '.') as any, // Cast to any for now
      totalGrupoValorTotal: item.totalGrupoValorTotal
        .replace('R$', '')
        .trim()
        .replace(',', '.') as any // Cast to any for now
      // Other fields from SipacRequisicaoMaterial are not in this response structure
      // and will be left as undefined or handled separately if needed.
    };
  }

  static toItemRequisicaoMaterialManutencaoDto(
    item: SipacItemRequisicaoMaterialManutencaoResponse
  ): SipacItemRequisicaoMaterialManutencaoDto {
    // Need to extract code and description from 'material' string
    const materialMatch = item.material.match(/^(\d+)\s*-\s*(.*)$/);
    const codigo = materialMatch ? materialMatch[1] : undefined;
    // const denominacao = materialMatch ? materialMatch[2].trim() : item.material; // Not needed for DTO

    return {
      // requisicaoId will be set by the service
      material: item.material, // Keep original string for now
      quantidade: parseInt(item.quantidade, 10), // Assuming quantity is integer
      valor: item.valor.replace(',', '.') as any, // Cast to any for now
      total: item.valorTotal.replace(',', '.') as any, // Cast to any for now
      codigo: codigo // Extracted code
      // Other fields from SipacItemRequisicaoMaterial are not in this response structure
      // and will be left as undefined or handled separately if needed.
    };
  }

  static toImovelPredioManutencaoDto(
    item: SipacImovelPredioManutencaoResponse
  ): SipacImovelPredioManutencaoDto {
    return {
      // requisicaoManutencaoId will be set by the service
      tipo: item.tipo,
      municipio: item.municipio,
      campus: item.campus,
      rip: item.rip,
      imovelTerreno: item['imovel/terreno'],
      predio: item.predio,
      zona: item.zona
    };
  }

  static toHistoricoManutencaoDto(
    item: SipacHistoricoManutencaoResponse
  ): SipacHistoricoManutencaoDto {
    return {
      // requisicaoManutencaoId will be set by the service
      data: SipacRequisicaoManutencaoMapper.parseDateString(item.data),
      status: item.status,
      usuario: item.usuario,
      ramal: item.ramal,
      observacoes: item.observacoes
    };
  }
}
