// src/sipac/sipac-paths.map.ts
import { SipacOptions } from './sipac-paths.interface';

/**
 * O mapa de mapeamentos.
 */
export const sipacPathMappings: Record<string, SipacOptions> = {
  // Exemplo GET sem queryParams - Válido
  'portal/administrativo': {
    url: 'https://sipac.ufrn.br/sipac/portal_administrativo/index.jsf',
    method: 'GET',
    parser: 'default', // Chave lógica para o parser
    // queryParams é opcional e ausente - OK
  },

  // Exemplo POST - Válido, pois queryParams está presente
  'requisicao/material': {
    url: 'https://sipac.ufrn.br/sipac/acompanharReqMaterial.do',
    method: 'POST',
    queryParams: ['id', 'requisicao', 'acao'],
    parser: 'req-material', // Chave lógica para o parser
  },

  'requisicao/manutencao': {
    url: 'https://sipac.ufrn.br/sipac/visualizaRequisicao.do',
    method: 'GET',
    queryParams: ['id'],
    parser: 'req-manutencao', // Chave lógica para o parser
  },

  'lista/requisicao/manutencao': {
    url: 'https://sipac.ufrn.br/sipac/buscaListaReq.do',
    method: 'POST',
    queryParams: [
      'pageNum',
      'buscaNumAno',
      'buscaTipo',
      'buscaStatus',
      'buscaUsuario',
      'buscaProponente',
      'buscaProposto',
      'buscaData',
      'buscaUnidadeReq',
      'dataInicial',
      'dataFinal',
      'proposto.cpf_cnpj',
      'usuario.id',
      'proponente.siape',
      'numero',
      // 'ano',
      'tipoReq.id',
      'status',
      'unidade.id',
      'buscaUnidadesSubordinadas',
      'buscaTipoServico',
      'grupoManutencao.id',
    ],
    parser: 'lista-manutencao', // Chave lógica para o parser
  },

  'lista/requisicao/material': {
    url: 'https://sipac.ufrn.br/sipac/buscaListaReq.do',
    method: 'POST',
    queryParams: [
      // 'pageNum',
      // 'buscaAlmoxarifado',
      // 'idAlmoxarifado',
      // 'buscaNumAno',
      // 'buscaTipo',
      // 'buscaStatus',
      // 'buscaUsuario',
      // 'buscaProponente',
      // 'buscaProposto',
      // 'buscaData',
      // 'buscaUnidadeReq',
      // 'dataInicial',
      // 'dataFinal',
      // 'proposto.cpf_cnpj',
      // 'usuario.id',
      // 'proponente.siape',
      // 'numero',
      // 'ano',
      'tipoReq.id',
      // 'status',
      // 'unidade.id',
      // 'buscaUnidadesSubordinadas',
      'grupoManutencao.id',
    ],
    parser: 'lista-material', // Chave lógica para o parser
  },
};
