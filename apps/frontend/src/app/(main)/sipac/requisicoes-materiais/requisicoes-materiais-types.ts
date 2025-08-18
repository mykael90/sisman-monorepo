import { Prisma, SipacRequisicaoMaterial } from '@sisman/prisma';

export interface ISipacRequisicaoMaterial extends SipacRequisicaoMaterial {}

export interface ISipacRequisicaoMaterialRelationsOnly
  extends Prisma.SipacRequisicaoMaterialGetPayload<{
    include: {
      detalhesDaAquisicao: true;
      informacoesServico: true;
      unidadeRequisitante: true;
      unidadeCusto: true;
      grupoMaterial: true;
      historicoDaRequisicao: true;
      itensDaRequisicao: true;
      sipacRequisicaoManutencao: true;
      totalizacaoPorElementoDeDespesasDetalhados: true;
    };
  }> {}

export type ISipacRequisicaoMaterialWithRelations = ISipacRequisicaoMaterial &
  Partial<ISipacRequisicaoMaterialRelationsOnly>;
