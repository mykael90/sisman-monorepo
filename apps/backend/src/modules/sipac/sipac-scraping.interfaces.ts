import { Prisma } from '@sisman/prisma';

export interface metadataScraping {
  url: string;
  dateExtraction: string;
  parser: string;
  method: string;
  body: string;
}

export interface SipacPaginatedScrapingResponse<T> {
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
export interface SipacSingleScrapingResponse<T> {
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
