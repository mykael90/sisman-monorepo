import { Prisma } from '@sisman/prisma';

export interface metadataScraping {
  url: string;
  dateExtraction: string;
  parser: string;
  method: string;
  body: string;
}

export interface SipacPaginatedScrapingResponse<
  T extends
    | SipacListaRequisicaoMaterialResponseItem
    | SipacListaRequisicaoManutencaoResponseItem
> {
  metadata: metadataScraping;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}
export interface SipacSingleScrapingResponse<
  T extends
    | SipacRequisicaoMaterialResponseItem
    | SipacRequisicaoManutencaoResponseItem
> {
  metadata: metadataScraping;
  data: T;
}

export interface SyncResult {
  totalProcessed: number;
  successful: number;
  failed: number;
}

export interface SipacListaRequisicaoMaterialResponseItem
  extends Prisma.SipacRequisicaoMaterialCreateManyInput {
  data: string;
  requisicao: string;
  unidadeRequisitante: string;
  unidadeCusto: string;
  grupoMaterial: string;
  tipoDaRequisicao: string;
  almoxarifado: string;
  status: string;
  usuarioDetalhes: string;
  usuario: string;
  valor: string;
  id: number;
}

// --- Interfaces for Detailed Material Requisition Response ---

/**
 * Represents an item within the "itensDaRequisicao" array of a detailed material requisition.
 */
export interface SipacItemDaRequisicaoMaterial {
  numeroitem: string;
  codigo: string;
  denominacao: string;
  unidademedida: string;
  qt: string;
  valor: string;
  total: string;
  quantidadeatendida: string;
  quantidadedevolvida: string;
  quantidadeemcompra: string;
  valoratendimento: string;
  totalatendimento: string;
  status: string;
}

/**
 * Represents an entry in the "historicoDaRequisicao" array of a detailed material requisition.
 */
export interface SipacHistoricoDaRequisicaoMaterial {
  datahora: string;
  status: string;
  usuario: string;
  observacoes: string;
}

/**
 * Represents the 'data' field of the detailed maintenance requisition response from SIPAC.
 */
export interface SipacRequisicaoManutencaoResponseItem {
  dadosDaRequisicao: {
    detalhesAninhados: SipacDadosDaRequisicaoManutencaoResponse;
  };
  informacoesDoServico: SipacInformacoesDoServicoManutencaoResponse[];
  requisicoesDeManutencaoAssociadas: SipacRequisicaoManutencaoAssociadaResponse[];
  requisicoesAssociadasDeMateriais: SipacRequisicaoMaterialAssociadaManutencaoResponse[];
  'imoveis/prediosInseridos': SipacImovelPredioManutencaoResponse[];
  historico: SipacHistoricoManutencaoResponse[];
}

/**
 * Represents an item in the list response for maintenance requisitions.
 */
export interface SipacListaRequisicaoManutencaoResponseItem {
  numeroAno: string;
  descricao: string;
  local: string;
  tipo: string;
  status: string;
  usuarioDetalhes: string;
  usuario: string;
  id: number;
}

/**
 * Represents the "dadosDaRequisicao" object within a detailed material requisition response.
 */
export interface SipacDadosDaRequisicaoMaterial {
  numeroDaRequisicao: string;
  tipo: string;
  convenio: string;
  grupoDeMaterial: string;
  unidadeDeCusto: string;
  unidadeRequisitante: string;
  destinoDaRequisicao: string;
  usuario: string;
  email: string;
  dataDeCadastro: string;
  dataDeEnvio: string;
  valorDaRequisicao: string;
  valorDoTotalAtendido: string;
  opcaoOrcamentaria: string;
  numeroDaRequisicaoRelacionada: string;
  local: string;
  observacoes: string;
  statusAtual: string;
  itensDaRequisicao: SipacItemDaRequisicaoMaterial[];
  historicoDaRequisicao: SipacHistoricoDaRequisicaoMaterial[];
}

/**
 * Represents an item in the "totalizacaoPorElementosDeDespesasDetalhados" array.
 */
export interface SipacTotalizacaoElementoDespesaMaterial {
  grupoDeMaterial: string;
  total: string;
}

/**
 * Represents an item in the "detalhesDaAquisicaoDosItens" array.
 * Note: The fields are strings based on the example "Nenhum ... cadastrado".
 * These could be more complex objects if the actual data structure varies.
 */
export interface SipacDetalheAquisicaoItemMaterial {
  compras: string;
  empenhos: string;
  notasFiscais: string;
  processosDePagamento: string;
}

/**
 * Represents the 'data' field of the detailed material requisition response from SIPAC,
 * as per the provided example.
 */
export interface SipacRequisicaoMaterialResponseItem {
  dadosDaRequisicao: SipacDadosDaRequisicaoMaterial;
  totalizacaoPorElementosDeDespesasDetalhados: SipacTotalizacaoElementoDespesaMaterial[];
  detalhesDaAquisicaoDosItens: SipacDetalheAquisicaoItemMaterial[];
}

// --- Interfaces for Detailed Maintenance Requisition Response ---

/**
 * Represents the nested details within the "dadosDaRequisicao" object of a maintenance requisition.
 */
export interface SipacDadosDaRequisicaoManutencaoResponse {
  requisicao: string;
  tipoDaRequisicao: string;
  divisao: string;
  requisicaoGravadaPeloUsuario: string;
  status: string;
  dataDeCadastro: string;
  unidadeRequisitante: string;
  unidadeDeCusto: string;
  descricao: string;
  local: string;
  representanteDaUnidadeDeOrigem: string;
  telefonesDoRepresentante: string;
  ramal: string;
  email: string;
  horarioParaAtendimento: string;
  observacao: string;
}

/**
 * Represents an item in the "informacoesDoServico" array of a maintenance requisition.
 */
export interface SipacInformacoesDoServicoManutencaoResponse {
  diagnostico: string;
  executante: string;
  dataDeCadastro: string;
  tecnicoResponsavel: string;
}

/**
 * Represents an item in the "requisicoesDeManutencaoAssociadas" array of a maintenance requisition.
 */
export interface SipacRequisicaoManutencaoAssociadaResponse {
  'numero/ano': string;
  descricao: string;
  status: string;
  dataDeCadastro: string;
  usuario: string;
  id: string;
}

/**
 * Represents an item within the "itens" array of an associated material requisition in a maintenance requisition response.
 */
export interface SipacItemRequisicaoMaterialManutencaoResponse {
  material: string;
  quantidade: string;
  valor: string;
  valorTotal: string;
}

/**
 * Represents an item in the "requisicoesAssociadasDeMateriais" array of a maintenance requisition response.
 */
export interface SipacRequisicaoMaterialAssociadaManutencaoResponse {
  id: string;
  requisicao: string;
  grupo: string;
  dataCadastro: string;
  status: string;
  itens: SipacItemRequisicaoMaterialManutencaoResponse[];
  totalGrupoQuantidade: string;
  totalGrupoValorCalculado: string;
  totalGrupoValorTotal: string;
}

/**
 * Represents an item in the "imoveis/prediosInseridos" array of a maintenance requisition response.
 */
export interface SipacImovelPredioManutencaoResponse {
  tipo: string;
  municipio: string;
  campus: string;
  rip: string;
  'imovel/terreno': string;
  predio: string;
  zona: string;
}

/**
 * Represents an item in the "historico" array of a maintenance requisition response.
 */
export interface SipacHistoricoManutencaoResponse {
  data: string;
  status: string;
  usuario: string;
  ramal: string;
  observacoes: string;
}
