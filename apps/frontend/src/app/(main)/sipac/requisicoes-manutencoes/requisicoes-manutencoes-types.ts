import { Prisma, SipacRequisicaoManutencao } from '@sisman/prisma';

export interface ISipacRequisicaoManutencao extends SipacRequisicaoManutencao {}

export interface ISipacRequisicaoManutencaoRelationsOnly extends Prisma.SipacRequisicaoManutencaoGetPayload<{
  select: {
    informacoesServico: true;
    requisicaoManutencaoMae: true;
    requisicoesManutencaoFilhas: true;
    requisicoesMateriais: true;
    predios: true;
    historico: true;
    unidadeRequisitante: true;
    unidadeCusto: true;
    arquivos: true;
  };
}> {}

export type ISipacRequisicaoManutencaoWithRelations =
  ISipacRequisicaoManutencao & Partial<ISipacRequisicaoManutencaoRelationsOnly>;

export type ISipacRequisicaoManutencaoShow =
  Prisma.SipacRequisicaoManutencaoGetPayload<{
    include: {
      informacoesServico: true;
      requisicoesMateriais: { include: { itensDaRequisicao: true } };
      predios: true;
      arquivos: true;
      historico: true;
      requisicaoManutencaoMae: true;
      requisicoesManutencaoFilhas: true;
      unidadeCusto: true;
      unidadeRequisitante: true;
    };
  }>;
