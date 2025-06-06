export interface SipacPaginatedResponse<T> {
  items: T[];
  offset: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface SyncResult {
  totalProcessed: number;
  successful: number;
  failed: number;
}

export interface SipacMaterialResponseItem {
  ativo: boolean;
  codigo: number; // Anteriormente string, agora number conforme a tabela
  'codigo-sidec': number;
  'consumo-energia': number;
  'data-ultima-compra': number; // Timestamp (integer)
  'denominacao-grupo': string;
  'denominacao-material': string; // Corresponde à antiga 'descricao'
  'denominacao-material-ascii': string;
  'denominacao-sub-grupo': string;
  'denominacao-unidade': string; // Corresponde à antiga 'unidadeMedida'
  especificacao: string;
  'especificacao-ascii': string;
  'id-grupo': number;
  'id-material': number; // Corresponde à antiga 'id'
  'id-sub-grupo': number;
  'preco-compra': number;
  'valor-estimado': number;
}

export interface SipacGrupoMaterialResponseItem {
  ativo: boolean;
  codigo: number; // integer($int64)
  denominacao: string;
  descricao: string;
  'id-elemento-despesa': number; // integer($int32)
  'id-grupo-material': number; // integer($int32)
}

export interface SipacSubGrupoMaterialResponseItem {
  codigo: number; // integer($int64)
  denominacao: string;
  'id-grupo-material': number; // integer($int32)
  'id-sub-grupo-material': number; // integer($int32)
}
